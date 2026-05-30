import express from "express";
import User from "../models/User.js";
import Deal from "../models/Deal.js";
import PriceAlert from "../models/PriceAlert.js";
import PriceHistory from "../models/PriceHistory.js";
import Product from "../models/Product.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { syncProductPrices, parseFullProducts, broadcastTopDeals } from "../utils/priceSync.js";
import { scrapeAmazonProduct } from "../utils/scraper.js";
import { sendTelegramMessage, escapeHtml } from "../utils/telegram.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE_PATH = path.join(__dirname, "..", "..", "data", "products.ts");

const router = express.Router();

// Apply authentication and admin authorization middlewares to all routes
router.use(protect);
router.use(requireAdmin);

// ──────────────────────────────────────────────────────────────────────────────
// GET ADMIN DASHBOARD STATS
// ──────────────────────────────────────────────────────────────────────────────
router.get("/stats", async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalDeals = await Deal.countDocuments({});
    const activeAlerts = await PriceAlert.countDocuments({ isActive: true });
    const priceHistoryPoints = await PriceHistory.countDocuments({});

    // Read static products metadata for analytics
    const products = parseFullProducts();
    
    // Category distribution from static catalog
    const categoriesMap = {};
    products.forEach((p) => {
      const cat = p.category || "other";
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    const categoryStats = Object.keys(categoriesMap).map((key) => ({
      name: key,
      value: categoriesMap[key],
    }));

    // Calculate user signup trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const usersTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDeals,
        activeAlerts,
        priceHistoryPoints,
        totalProductsCatalog: products.length,
      },
      categoryStats,
      usersTrend,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// TRIGGER MANUAL PRICE/PRODUCT SYNCHRONIZATION
// ──────────────────────────────────────────────────────────────────────────────
router.post("/sync", async (req, res, next) => {
  try {
    console.log("🛠️ Manual Price Sync triggered by admin:", req.user.email);
    const result = await syncProductPrices();
    
    res.status(200).json({
      success: true,
      message: `Price synchronization triggered successfully. ${result.updatedCount} new price points logged.`,
      updatedCount: result.updatedCount,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/broadcast-deals", async (req, res, next) => {
  try {
    console.log("📢 Manual Telegram Channel Broadcast triggered by admin:", req.user.email);
    const result = await broadcastTopDeals();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Successfully broadcasted the top 3 budget deals to your Telegram channel!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
      });
    }
  } catch (err) {
    next(err);
  }
});

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function appendProductToTS(product) {
  if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
    throw new Error(`products.ts not found at: ${PRODUCTS_FILE_PATH}`);
  }

  const content = fs.readFileSync(PRODUCTS_FILE_PATH, "utf8");
  const lastIndex = content.lastIndexOf("];");
  if (lastIndex === -1) {
    throw new Error("Could not find the end of products array in products.ts");
  }

  const features = product.features || [];
  const pros = [
    "Great discount on premium performance.",
    "Verified Amazon customer rating.",
    "Fast shipping options in India."
  ];
  const cons = [
    "Price fluctuations are common; grab it while discounted."
  ];
  const tags = [product.category, "Amazon Deals", "SmartPicks Choice"];

  const productString = `  {
    slug: ${JSON.stringify(product.slug)},
    title: ${JSON.stringify(product.title)},
    image: ${JSON.stringify(product.image)},
    category: ${JSON.stringify(product.category)},
    description: ${JSON.stringify(product.description || "")},
    price: ${product.price},
    oldPrice: ${product.originalPrice},
    rating: ${product.rating || 4.5},
    reviewCount: ${product.reviewCount || 100},
    affiliateLink: ${JSON.stringify(product.affiliateLink)},
    features: ${JSON.stringify(features)},
    pros: ${JSON.stringify(pros)},
    cons: ${JSON.stringify(cons)},
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ${JSON.stringify(tags)},
  }`;

  const beforeArrayEnd = content.slice(0, lastIndex).trim();
  const endsWithComma = beforeArrayEnd.endsWith(",");
  
  const newContent = beforeArrayEnd + 
    (endsWithComma ? "" : ",\n") + 
    productString + 
    "\n];\n";
    
  fs.writeFileSync(PRODUCTS_FILE_PATH, newContent, "utf8");
}

// ──────────────────────────────────────────────────────────────────────────────
// POST SCRAPE AMAZON PRODUCT & AUTO-PUBLISH
// ──────────────────────────────────────────────────────────────────────────────
router.post("/scrape-product", async (req, res, next) => {
  try {
    const { asin, category } = req.body;

    if (!asin || !category) {
      return res.status(400).json({ success: false, message: "ASIN and Category are required." });
    }

    const cleanAsin = asin.toUpperCase().trim();
    const cleanCategory = category.toLowerCase().trim();

    // 1. Check duplicate in products.ts catalog first
    const catalogProducts = parseFullProducts();
    const isDuplicateInCatalog = catalogProducts.some(p => {
      const match = p.affiliateLink.match(/\/dp\/([A-Z0-9]{10})/i) || p.affiliateLink.match(/\/gp\/product\/([A-Z0-9]{10})/i);
      return match && match[1].toUpperCase() === cleanAsin;
    });

    if (isDuplicateInCatalog) {
      return res.status(400).json({
        success: false,
        message: `Product with ASIN ${cleanAsin} already exists in the local products.ts catalog.`,
      });
    }

    // 2. Check duplicate in MongoDB database
    const isDuplicateInDb = await Product.findOne({ asin: cleanAsin });
    if (isDuplicateInDb) {
      return res.status(400).json({
        success: false,
        message: `Product with ASIN ${cleanAsin} already exists in MongoDB database.`,
      });
    }

    // 3. Scrape from RapidAPI (or mock fallback)
    console.log(`🤖 Scraping details for ASIN: ${cleanAsin} (Category: ${cleanCategory})...`);
    const scraped = await scrapeAmazonProduct(cleanAsin);

    // 4. Generate unique slug
    let baseSlug = slugify(scraped.title);
    if (!baseSlug.endsWith("-review")) {
      baseSlug += "-review";
    }

    let slug = baseSlug;
    let slugCounter = 1;
    while (catalogProducts.some(p => p.slug === slug)) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    scraped.slug = slug;
    scraped.category = cleanCategory;
    scraped.affiliateLink = `https://www.amazon.in/dp/${cleanAsin}?tag=smartpick07d2-21`;

    const pros = [
      "Great discount on premium performance.",
      "Verified Amazon customer rating.",
      "Fast shipping options in India."
    ];
    const cons = [
      "Price fluctuations are common; grab it while discounted."
    ];
    const tags = [cleanCategory, "Amazon Deals", "SmartPicks Choice"];

    // 5. Save to MongoDB Product Collection
    const newProduct = new Product({
      title: scraped.title,
      asin: cleanAsin,
      category: cleanCategory,
      price: scraped.price,
      originalPrice: scraped.originalPrice,
      discount: scraped.discount,
      image: scraped.image,
      rating: scraped.rating,
      reviewCount: scraped.reviewCount,
      affiliateLink: scraped.affiliateLink,
      trending: true,
      slug: slug,
      description: scraped.description || "",
      features: scraped.features || [],
      pros,
      cons,
      tags,
      featured: false,
      dealOfTheDay: false,
    });
    await newProduct.save();

    // 6. Append to local products.ts
    console.log(`✍️ Appending product to products.ts catalog...`);
    appendProductToTS(scraped);

    // 7. Inject mock PriceHistory records to feed the client SVG chart
    console.log(`📈 Creating price history log for slug: ${slug}...`);
    const pricePoints = [];
    const basePrice = scraped.price;
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 6); // 5 records spanning 24 days
      // Create slight variations (max 5%) using a wave function
      const priceOffset = Math.round(basePrice * (1 + (Math.sin(i) * 0.05)));
      pricePoints.push({
        slug: slug,
        price: i === 0 ? basePrice : priceOffset,
        date,
      });
    }
    await PriceHistory.insertMany(pricePoints);

    // 8. Auto-post to Telegram Channel
    console.log(`📢 Auto-posting scraped product to Telegram channel...`);
    const siteUrl = process.env.CLIENT_URL || "https://smart-picks-india.vercel.app";
    const safeTitle = escapeHtml(scraped.title);
    const safeDesc = escapeHtml((scraped.description || "").slice(0, 120));
    // Always use a direct /dp/ Amazon affiliate link for maximum compatibility
    const amazonLink = `https://www.amazon.in/dp/${cleanAsin}?tag=smartpick07d2-21`;
    const reviewLink = `${siteUrl}/product/${slug}`;

    const tgHtml =
      `🔥 <b>HOT NEW DEAL AUTO-PUBLISHED!</b> 🔥\n\n` +
      `<b>${safeTitle}</b>\n\n` +
      `💰 Deal Price: <b>₹${scraped.price.toLocaleString("en-IN")}</b>  <s>₹${scraped.originalPrice.toLocaleString("en-IN")}</s>\n` +
      `🏷️ Discount: <b>${scraped.discount}% OFF</b>\n` +
      `⭐ Rating: ${scraped.rating} / 5 (${scraped.reviewCount.toLocaleString("en-IN")} ratings)\n\n` +
      `📝 <i>"${safeDesc}..."</i>\n\n` +
      `🛒 <a href="${amazonLink}">👉 BUY ON AMAZON NOW</a>\n` +
      `📄 <a href="${reviewLink}">Read Full Review on SmartPicks India</a>\n\n` +
      `👉 Join @smartpicks_deals_deal for more instant budget deals!`;

    let telegramSent = false;
    let telegramError = null;
    try {
      await sendTelegramMessage(null, tgHtml);
      telegramSent = true;
    } catch (tgErr) {
      telegramError = tgErr.message;
      console.warn("⚠️ Telegram dispatch failed:", tgErr.message);
    }

    res.status(201).json({
      success: true,
      message: `Product successfully scraped, saved, and added to the catalog!`,
      product: {
        id: newProduct._id,
        slug,
        title: scraped.title,
        price: scraped.price,
        affiliateLink: scraped.affiliateLink,
        image: scraped.image,
      },
      telegramSent,
      telegramError,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET USERS LIST (ADMIN MANAGEMENT)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

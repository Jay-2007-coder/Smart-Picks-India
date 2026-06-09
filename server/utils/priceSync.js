import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PriceHistory from "../models/PriceHistory.js";
import PriceAlert from "../models/PriceAlert.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { sendEmail } from "./email.js"; // Standard email utility
import { sendTelegramMessage, escapeHtml } from "./telegram.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE_PATH = path.join(__dirname, "..", "..", "data", "products.ts");

// Regex parser to read TypeScript products file without requiring TS transpiler
export function parseProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
      console.warn("⚠️ products.ts file not found at:", PRODUCTS_FILE_PATH);
      return [];
    }
    const content = fs.readFileSync(PRODUCTS_FILE_PATH, "utf8");
    const entries = content.match(/\{[\s\S]*?\}/g) || [];
    const products = [];

    for (const entry of entries) {
      const slugMatch = entry.match(/slug:\s*["']([^"']+)["']/);
      const priceMatch = entry.match(/price:\s*(\d+)/);
      const titleMatch = entry.match(/title:\s*["']([^"']+)["']/);

      if (slugMatch && priceMatch) {
        products.push({
          slug: slugMatch[1],
          price: parseInt(priceMatch[1], 10),
          title: titleMatch ? titleMatch[1] : slugMatch[1],
        });
      }
    }
    return products;
  } catch (err) {
    console.error("❌ Error parsing products.ts:", err.message);
    return [];
  }
}

// Regex parser to extract full product metadata for chatbot & admin dashboard
export function parseFullProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
      console.warn("⚠️ products.ts file not found at:", PRODUCTS_FILE_PATH);
      return [];
    }
    const content = fs.readFileSync(PRODUCTS_FILE_PATH, "utf8");
    const arrayStartIndex = content.indexOf("export const products: Product[] = [");
    const arrayContent = arrayStartIndex !== -1 ? content.substring(arrayStartIndex) : content;
    const entries = arrayContent.match(/\{[\s\S]*?\}\s*(?=,|\s*\])/g) || [];
    const products = [];

    for (const entry of entries) {
      const slugMatch = entry.match(/slug:\s*["']([^"']+)["']/);
      const titleMatch = entry.match(/title:\s*["']([^"']+)["']/);
      const imageMatch = entry.match(/image:\s*["']([^"']+)["']/);
      const categoryMatch = entry.match(/category:\s*["']([^"']+)["']/);
      const descriptionMatch = entry.match(/description:\s*["']([^"']+)["']/);
      const priceMatch = entry.match(/price:\s*(\d+)/);
      const oldPriceMatch = entry.match(/oldPrice:\s*(\d+)/);
      const ratingMatch = entry.match(/rating:\s*([\d.]+)/);
      const reviewCountMatch = entry.match(/reviewCount:\s*(\d+)/);
      const affiliateLinkMatch = entry.match(/affiliateLink:\s*["']([^"']+)["']/);

      if (slugMatch) {
        products.push({
          slug: slugMatch[1],
          title: titleMatch ? titleMatch[1] : slugMatch[1],
          image: imageMatch ? imageMatch[1] : "",
          category: categoryMatch ? categoryMatch[1] : "",
          description: descriptionMatch ? descriptionMatch[1] : "",
          price: priceMatch ? parseInt(priceMatch[1], 10) : 0,
          oldPrice: oldPriceMatch ? parseInt(oldPriceMatch[1], 10) : 0,
          rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
          reviewCount: reviewCountMatch ? parseInt(reviewCountMatch[1], 10) : 0,
          affiliateLink: affiliateLinkMatch ? affiliateLinkMatch[1] : "",
        });
      }
    }
    return products;
  } catch (err) {
    console.error("❌ Error parsing full products.ts:", err.message);
    return [];
  }
}

// Catalog-to-Database Synchronization
export async function syncProductsFromCatalog() {
  console.log("📦 Starting Catalog-to-Database Synchronization...");
  try {
    const catalogProducts = parseFullProducts();
    console.log(`   Found ${catalogProducts.length} products in local catalog (data/products.ts).`);

    const syncedSlugs = [];

    for (const p of catalogProducts) {
      // Find duplicate or existing product by slug, title, or ASIN
      let dbProduct = await Product.findOne({ slug: p.slug });
      
      const asinMatch = p.affiliateLink.match(/\/dp\/([A-Z0-9-]{10,20})/i) || p.affiliateLink.match(/\/gp\/product\/([A-Z0-9-]{10,20})/i);
      const asin = asinMatch ? asinMatch[1].toUpperCase() : `MANUAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) || 0;

      const productFields = {
        title: p.title,
        asin,
        category: p.category.toLowerCase(),
        price: p.price,
        originalPrice: p.oldPrice,
        discount,
        image: p.image,
        rating: p.rating || 4.5,
        reviewCount: p.reviewCount || 100,
        affiliateLink: p.affiliateLink,
        trending: true,
        slug: p.slug,
        description: p.description || "",
        features: p.features || [],
        pros: p.pros || [
          "Great discount on premium performance.",
          "Verified Amazon customer rating.",
          "Fast shipping options in India."
        ],
        cons: p.cons || [
          "Price fluctuations are common; grab it while discounted."
        ],
        tags: p.tags || [p.category, "Amazon Deals", "SmartPicks Choice"],
        featured: p.featured || false,
        dealOfTheDay: p.dealOfTheDay || false,
      };

      if (dbProduct) {
        // Update existing product
        Object.assign(dbProduct, productFields);
        await dbProduct.save();
        console.log(`   🔄 Updated existing Product in DB: "${p.title}" (Slug: ${p.slug})`);
      } else {
        // Create new product
        dbProduct = new Product({
          ...productFields,
          flashDeal: true,
          flashDealEndsAt: new Date(Date.now() + 3.75 * 60 * 60 * 1000) // active flash deals!
        });
        await dbProduct.save();
        console.log(`   ✅ Created new Product in DB: "${p.title}" (Slug: ${p.slug})`);
      }
      syncedSlugs.push(p.slug);
    }

    // Delete any products from MongoDB that are no longer in catalog data/products.ts
    const deleteResult = await Product.deleteMany({ slug: { $nin: syncedSlugs } });
    if (deleteResult.deletedCount > 0) {
      console.log(`   🧹 Deleted ${deleteResult.deletedCount} outdated/fake product(s) from database.`);
    }

    console.log("🎉 Catalog synchronization complete.");
    return { success: true, syncedCount: syncedSlugs.length, deletedCount: deleteResult.deletedCount };
  } catch (err) {
    console.error("❌ Error syncing products from catalog:", err.message);
    return { success: false, error: err.message };
  }
}

// Core sync runner
export async function syncProductPrices() {
  console.log("🔄 Starting Price Synchronization...");
  const products = await Product.find({});
  console.log(`   Found ${products.length} products to check.`);

  let updatedCount = 0;

  for (const product of products) {
    try {
      // Find the latest price history record for this product
      const latestHistory = await PriceHistory.findOne({ slug: product.slug }).sort({ date: -1 });

      const priceChanged = !latestHistory || latestHistory.price !== product.price;

      if (priceChanged) {
        // Record new history entry
        const historyRecord = new PriceHistory({
          slug: product.slug,
          price: product.price,
          date: new Date(),
        });
        await historyRecord.save();
        updatedCount++;

        console.log(`   📈 Price change logged for "${product.title}": ₹${product.price} (previous: ₹${latestHistory ? latestHistory.price : "none"})`);

        // If price dropped, check for alert triggers
        if (latestHistory && product.price < latestHistory.price) {
          await checkAndTriggerAlerts(product, latestHistory.price);
          await postDealToChannel(product, latestHistory.price);
        }
      }
    } catch (err) {
      console.error(`   ❌ Failed to sync price for ${product.slug}:`, err.message);
    }
  }

  console.log(`🎉 Price Sync Complete. Logged ${updatedCount} price history update(s).`);
  return { success: true, updatedCount };
}

// Scan and trigger notifications for active user alerts
async function checkAndTriggerAlerts(product, oldPrice) {
  try {
    // Find active alerts where targetPrice >= current product price
    const alerts = await PriceAlert.find({
      slug: product.slug,
      isActive: true,
      targetPrice: { $gte: product.price },
    }).populate("userId");

    if (alerts.length === 0) return;

    console.log(`   🔔 Triggering ${alerts.length} alert(s) for "${product.title}"`);

    for (const alert of alerts) {
      const user = alert.userId;
      if (!user) continue;

      const title = `Price Drop Alert: ${product.title}`;
      const message = `Good news! The price of "${product.title}" has dropped from ₹${oldPrice} to ₹${product.price}.\n\nView deal on SmartPicks India: https://smart-picks-india.vercel.app/product/${product.slug}`;

      if (alert.deliveryMethod === "email") {
        // Send email notification
        try {
          await sendEmail({
            to: user.email,
            subject: title,
            html: `
              <h2>Price Drop Alert!</h2>
              <p>Hi ${user.name},</p>
              <p>Good news! A product on your watchlist has dropped in price.</p>
              <table style="border: 1px solid #eee; padding: 15px; width: 100%;">
                <tr>
                  <td><strong>Product:</strong></td>
                  <td>${product.title}</td>
                </tr>
                  <td><strong>Old Price:</strong></td>
                  <td><del>₹${oldPrice}</del></td>
                </tr>
                <tr>
                  <td><strong>New Price:</strong></td>
                  <td style="color: #10b981; font-weight: bold;">₹${product.price}</td>
                </tr>
              </table>
              <p><a href="https://smart-picks-india.vercel.app/product/${product.slug}" style="background-color: #df3838; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Claim Deal Now</a></p>
            `,
          });
          console.log(`      ✉️ Sent price alert email to ${user.email}`);
        } catch (mailErr) {
          console.error(`      ❌ Failed to send email alert:`, mailErr.message);
        }
      } else if (alert.deliveryMethod === "telegram" && user.telegramChatId) {
        // Send Telegram alert
        try {
          const safeTitle = escapeHtml(product.title);
          const affiliateLink = product.affiliateLink || `https://www.amazon.in/dp/${product.slug}?tag=smartpick07d2-21`;
          const tgHtml = `🔔 <b>Price Drop Alert!</b>\n\n<b>${safeTitle}</b>\n\n💸 Price dropped from <s>₹${oldPrice.toLocaleString("en-IN")}</s> to <b>₹${product.price.toLocaleString("en-IN")}</b>!\n\n🛒 <a href="${affiliateLink}">👉 Buy Direct on Amazon</a>\n📝 <a href="https://smart-picks-india.vercel.app/product/${product.slug}">Read Full Review</a>`;
          await sendTelegramMessage(user.telegramChatId, tgHtml);
          console.log(`      📱 Sent Telegram alert message to chat ${user.telegramChatId}`);
        } catch (tgErr) {
          console.error(`      ❌ Failed to send Telegram alert:`, tgErr.message);
        }
      }

      // Deactivate the alert so we don't spam the user (they can turn it back on)
      alert.isActive = false;
      await alert.save();
    }
  } catch (err) {
    console.error("❌ Error triggering alerts:", err.message);
  }
}

// Post a premium deal drop to the public channel
async function postDealToChannel(product, oldPrice) {
  try {
    const discount = Math.round(((oldPrice - product.price) / oldPrice) * 100);
    const safeTitle = escapeHtml(product.title);
    // Always build a direct /dp/ Amazon link with affiliate tag
    const affiliateLink = product.affiliateLink && product.affiliateLink.includes("/dp/")
      ? product.affiliateLink
      : `https://www.amazon.in/dp/${product.slug}?tag=smartpick07d2-21`;
    const siteReviewLink = `https://smart-picks-india.vercel.app/product/${product.slug}`;

    const tgHtml =
      `🔥 <b>LIVE DEAL DROP!</b> 🔥\n\n` +
      `<b>${safeTitle}</b>\n\n` +
      `📉 Price dropped from <s>₹${oldPrice.toLocaleString("en-IN")}</s> to <b>₹${product.price.toLocaleString("en-IN")}</b> — <b>${discount}% OFF!</b>\n\n` +
      `🛒 <a href="${affiliateLink}">👉 BUY ON AMAZON NOW</a>\n` +
      `📝 <a href="${siteReviewLink}">Read Full Review</a>\n\n` +
      `👉 Join @smartpicks_deals_deal for more instant budget deals!`;

    await sendTelegramMessage(null, tgHtml);
    console.log(`      📢 Posted deal drop for "${product.title}" to public Telegram channel`);
  } catch (err) {
    console.error(`      ❌ Failed to post deal drop to channel:`, err.message);
  }
}

// Broadcasts the top 3 biggest discount deals from catalog to the public Telegram channel
export async function broadcastTopDeals() {
  const products = await Product.find({});
  const deals = products
    .filter(p => p.originalPrice > p.price)
    .map(p => ({
      slug: p.slug,
      title: p.title,
      price: p.price,
      oldPrice: p.originalPrice || p.price,
      affiliateLink: p.affiliateLink,
      discount: Math.round((((p.originalPrice || p.price) - p.price) / (p.originalPrice || p.price)) * 100)
    }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 3);

  if (deals.length === 0) {
    return { success: false, message: "No discounted products found in catalog." };
  }

  const medals = ["1️⃣", "2️⃣", "3️⃣"];
  let html = `🔥 <b>TODAY'S HOTTEST BUDGET PICKS!</b> 🔥\n\nTop discounts live on SmartPicks India:\n\n`;

  deals.forEach((d, idx) => {
    // Use direct /dp/ link when available, else build one from slug guess
    const amazonLink = d.affiliateLink && d.affiliateLink.includes("/dp/")
      ? d.affiliateLink
      : d.affiliateLink || `https://www.amazon.in/s?k=${encodeURIComponent(d.title)}&tag=smartpick07d2-21`;
    const reviewLink = `https://smart-picks-india.vercel.app/product/${d.slug}`;
    const safeTitle = escapeHtml(d.title);

    html +=
      `${medals[idx]} <b>${safeTitle}</b>\n` +
      `💥 Deal Price: <b>₹${d.price.toLocaleString("en-IN")}</b>  <s>₹${d.oldPrice.toLocaleString("en-IN")}</s>\n` +
      `🏷️ Discount: <b>${d.discount}% OFF</b>\n` +
      `🛒 <a href="${amazonLink}">👉 BUY ON AMAZON</a>  |  📝 <a href="${reviewLink}">Review</a>\n\n`;
  });

  html += `👉 Join @smartpicks_deals_deal for more daily smart picks!`;

  await sendTelegramMessage(null, html);
  return { success: true, count: deals.length };
}

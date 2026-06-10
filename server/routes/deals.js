import express from "express";
import Deal from "../models/Deal.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/auth.js";
import { syncProductsFromCatalog } from "../utils/priceSync.js";

const router = express.Router();

// Helper to update deal score and save
async function updateDealScore(deal) {
  deal.calculateScore();
  await deal.save();
}

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET COMMUNITY DEALS (HOT / NEW)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { sort } = req.query; // 'hot' or 'new'
    
    // Recalculate scores for all active deals to account for time decay
    const dealsToUpdate = await Deal.find({});
    for (const deal of dealsToUpdate) {
      deal.calculateScore();
      await deal.save();
    }

    let sortOption = { score: -1 }; // Default: Hot
    if (sort === "new") {
      sortOption = { createdAt: -1 };
    }

    const deals = await Deal.find({})
      .populate("submittedBy", "name profileImage")
      .sort(sortOption);

    res.status(200).json({
      success: true,
      deals: deals.map((d) => ({
        id: d._id,
        title: d.title,
        category: d.category,
        url: d.url,
        price: d.price,
        oldPrice: d.oldPrice,
        image: d.image,
        submittedBy: d.submittedBy,
        upvotesCount: d.upvotes.length,
        downvotesCount: d.downvotes.length,
        upvotes: d.upvotes,
        downvotes: d.downvotes,
        score: d.score,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET PRODUCT BY SLUG (fetch from MongoDB)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/product/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    let product = await Product.findOne({ slug });

    // Fallback: match by computed slug (migration check for legacy database entries)
    if (!product) {
      const allProducts = await Product.find({});
      const slugify = (text) => text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");

      product = allProducts.find(p => {
        let baseSlug = slugify(p.title);
        if (!baseSlug.endsWith("-review")) {
          baseSlug += "-review";
        }
        return baseSlug === slug;
      });

      if (product) {
        // Save computed slug to database for future quick lookups
        product.slug = slug;
        await product.save();
      }
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Default arrays and objects in case legacy database records are missing catalog fields
    const defaultFeatures = ["High quality build and materials", "Excellent value for money"];
    const defaultPros = [
      "Great discount on premium performance.",
      "Verified Amazon customer rating.",
      "Fast shipping options in India."
    ];
    const defaultCons = [
      "Price fluctuations are common; grab it while discounted."
    ];
    const defaultTags = [product.category, "Amazon Deals", "SmartPicks Choice"];

    res.status(200).json({
      success: true,
      product: {
        slug: product.slug || slug,
        title: product.title,
        image: product.image,
        category: product.category,
        description: product.description || "Premium Amazon India Product.",
        price: product.price,
        oldPrice: product.originalPrice || product.price,
        rating: product.rating || 4.5,
        reviewCount: product.reviewCount || 100,
        affiliateLink: product.affiliateLink,
        features: product.features && product.features.length > 0 ? product.features : defaultFeatures,
        pros: product.pros && product.pros.length > 0 ? product.pros : defaultPros,
        cons: product.cons && product.cons.length > 0 ? product.cons : defaultCons,
        featured: product.featured || false,
        trending: product.trending !== undefined ? product.trending : true,
        dealOfTheDay: product.dealOfTheDay || false,
        tags: product.tags && product.tags.length > 0 ? product.tags : defaultTags,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET FLASH DEALS (Active timers)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/flash", async (req, res, next) => {
  try {
    const now = new Date();
    // Query MongoDB for products with flashDeal active and not expired
    let flashProducts = await Product.find({
      flashDeal: true,
      flashDealEndsAt: { $gt: now },
    });

    // Fallback: If no flash deals found in DB, return 4 database products as simulated flash deals
    if (flashProducts.length === 0) {
      const allDbProducts = await Product.find({});
      // Filter products that have a discount (originalPrice > price)
      const deals = allDbProducts
        .filter((p) => p.originalPrice > p.price)
        .slice(0, 4)
        .map((p) => {
          // Simulate expiration date: 3 hours and 45 minutes from now
          const expiresAt = new Date(Date.now() + 3.75 * 60 * 60 * 1000);
          return {
            slug: p.slug,
            title: p.title,
            image: p.image,
            category: p.category,
            description: p.description || "",
            price: p.price,
            oldPrice: p.originalPrice || p.price,
            rating: p.rating || 4.5,
            reviewCount: p.reviewCount || 100,
            affiliateLink: p.affiliateLink,
            flashDeal: true,
            flashDealEndsAt: expiresAt,
          };
        });
      return res.status(200).json({ success: true, deals });
    }

    res.status(200).json({
      success: true,
      deals: flashProducts.map((p) => ({
        slug: p.slug,
        title: p.title,
        image: p.image,
        category: p.category,
        description: p.description,
        price: p.price,
        oldPrice: p.originalPrice || p.price,
        rating: p.rating,
        reviewCount: p.reviewCount,
        affiliateLink: p.affiliateLink,
        flashDeal: true,
        flashDealEndsAt: p.flashDealEndsAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// PUBLIC: TRIGGER DYNAMIC CATALOG SYNC
router.get("/sync-now", async (req, res, next) => {
  try {
    const result = await syncProductsFromCatalog();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Apply protect middleware for submit and vote routes
router.use(protect);

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED: SUBMIT A DEAL
// ──────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { title, category, url, price, oldPrice, image } = req.body;
    const userId = req.user._id;

    if (!title || !category || !url || !price) {
      return res.status(400).json({
        success: false,
        message: "Title, category, URL, and price are required fields.",
      });
    }

    const parsedPrice = parseFloat(price);
    const parsedOldPrice = oldPrice ? parseFloat(oldPrice) : null;

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price. Must be a positive number.",
      });
    }

    const deal = new Deal({
      title,
      category,
      url,
      price: parsedPrice,
      oldPrice: parsedOldPrice,
      image: image || "",
      submittedBy: userId,
      upvotes: [userId], // Author automatically upvotes their deal
      downvotes: [],
    });

    deal.calculateScore();
    await deal.save();

    res.status(201).json({
      success: true,
      message: "Deal submitted successfully!",
      deal,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED: UPVOTE A DEAL
// ──────────────────────────────────────────────────────────────────────────────
router.post("/:id/upvote", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found." });
    }

    const hasUpvoted = deal.upvotes.includes(userId);
    const hasDownvoted = deal.downvotes.includes(userId);

    if (hasUpvoted) {
      // Remove upvote
      deal.upvotes = deal.upvotes.filter((uid) => !uid.equals(userId));
    } else {
      // Add upvote, remove downvote if present
      deal.upvotes.push(userId);
      if (hasDownvoted) {
        deal.downvotes = deal.downvotes.filter((uid) => !uid.equals(userId));
      }
    }

    await updateDealScore(deal);

    res.status(200).json({
      success: true,
      message: hasUpvoted ? "Upvote removed" : "Deal upvoted",
      upvotesCount: deal.upvotes.length,
      downvotesCount: deal.downvotes.length,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED: DOWNVOTE A DEAL
// ──────────────────────────────────────────────────────────────────────────────
router.post("/:id/downvote", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deal = await Deal.findById(id);
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found." });
    }

    const hasUpvoted = deal.upvotes.includes(userId);
    const hasDownvoted = deal.downvotes.includes(userId);

    if (hasDownvoted) {
      // Remove downvote
      deal.downvotes = deal.downvotes.filter((uid) => !uid.equals(userId));
    } else {
      // Add downvote, remove upvote if present
      deal.downvotes.push(userId);
      if (hasUpvoted) {
        deal.upvotes = deal.upvotes.filter((uid) => !uid.equals(userId));
      }
    }

    await updateDealScore(deal);

    res.status(200).json({
      success: true,
      message: hasDownvoted ? "Downvote removed" : "Deal downvoted",
      upvotesCount: deal.upvotes.length,
      downvotesCount: deal.downvotes.length,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

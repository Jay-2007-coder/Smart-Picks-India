import express from "express";
import Deal from "../models/Deal.js";
import { protect } from "../middleware/auth.js";

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

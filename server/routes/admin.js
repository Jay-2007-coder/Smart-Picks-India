import express from "express";
import User from "../models/User.js";
import Deal from "../models/Deal.js";
import PriceAlert from "../models/PriceAlert.js";
import PriceHistory from "../models/PriceHistory.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { syncProductPrices, parseFullProducts } from "../utils/priceSync.js";

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

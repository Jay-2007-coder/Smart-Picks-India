import express from "express";
import PriceAlert from "../models/PriceAlert.js";
import PriceHistory from "../models/PriceHistory.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET PRICE HISTORY FOR A PRODUCT
// ──────────────────────────────────────────────────────────────────────────────
router.get("/price-history/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Find all price history points for this slug, sorted by date ascending
    const history = await PriceHistory.find({ slug }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      history: history.map((h) => ({
        price: h.price,
        date: h.date,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// Apply protect middleware for alert subscriptions
router.use(protect);

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED: GET CURRENT USER'S ALERTS
// ──────────────────────────────────────────────────────────────────────────────
router.get("/my-alerts", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const alerts = await PriceAlert.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      alerts,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED: CREATE/SUBSCRIBE TO A PRICE ALERT
// ──────────────────────────────────────────────────────────────────────────────
router.post("/subscribe", async (req, res, next) => {
  try {
    const { slug, targetPrice, deliveryMethod } = req.body;
    const userId = req.user._id;

    if (!slug || !targetPrice) {
      return res.status(400).json({
        success: false,
        message: "Product slug and target price are required.",
      });
    }

    const parsedTargetPrice = parseFloat(targetPrice);
    if (isNaN(parsedTargetPrice) || parsedTargetPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid target price. Must be a positive number.",
      });
    }

    if (deliveryMethod === "telegram" && !req.user.telegramChatId) {
      return res.status(400).json({
        success: false,
        message: "Please connect your Telegram account first to receive Telegram alerts.",
      });
    }

    // Check if an alert for this slug already exists for this user and is active
    let alert = await PriceAlert.findOne({
      userId,
      slug,
      isActive: true,
    });

    if (alert) {
      // Update target price and delivery method
      alert.targetPrice = parsedTargetPrice;
      alert.deliveryMethod = deliveryMethod || "email";
      await alert.save();
    } else {
      // Create a new price alert
      alert = new PriceAlert({
        userId,
        slug,
        targetPrice: parsedTargetPrice,
        deliveryMethod: deliveryMethod || "email",
      });
      await alert.save();
    }

    res.status(200).json({
      success: true,
      message: `Alert subscribed successfully at ₹${parsedTargetPrice}.`,
      alert,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED: DELETE/CANCEL A PRICE ALERT
// ──────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const alert = await PriceAlert.findOneAndDelete({ _id: id, userId });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Price alert not found or unauthorized.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Price alert canceled successfully.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;

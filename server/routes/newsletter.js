import express from "express";
import rateLimit from "express-rate-limit";
import Newsletter from "../models/Newsletter.js";

const router = express.Router();

// Basic rate limiter: max 3 attempts per IP per hour
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many subscription attempts from this IP. Please try again in an hour."
  }
});

router.post("/subscribe", newsletterLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email is already subscribed" });
    }

    // Create subscription
    await Newsletter.create({ email });

    return res.status(200).json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;

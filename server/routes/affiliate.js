import express from "express";
import rateLimit from "express-rate-limit";
import AffiliateApplication from "../models/AffiliateApplication.js";

const router = express.Router();

// Basic rate limiter: max 3 attempts per IP per hour
const affiliateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many application attempts from this IP. Please try again in an hour."
  }
});

router.post("/apply", affiliateLimiter, async (req, res, next) => {
  try {
    const { name, email, website, message } = req.body;

    if (!name || !email || !website || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please provide a valid email address" });
    }

    // Create application
    const application = await AffiliateApplication.create({
      name,
      email,
      website,
      message,
      status: "pending"
    });

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully",
      applicationId: application._id
    });
  } catch (err) {
    next(err);
  }
});

export default router;

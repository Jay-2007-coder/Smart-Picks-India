import express from "express";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import { protect } from "../middleware/auth.js";
import DigitalProduct from "../models/DigitalProduct.js";
import Purchase from "../models/Purchase.js";
import DownloadHistory from "../models/DownloadHistory.js";
import Favorite from "../models/Favorite.js";
import { sendEmail } from "../utils/email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "digital-products");

// Make sure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const router = express.Router();

// Initialize Razorpay Instance or flag Sandbox Mode
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";
const IS_SANDBOX = !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET;

let razorpay = null;
if (!IS_SANDBOX) {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log("💳 Razorpay Initialized in Production Mode");
  } catch (err) {
    console.error("❌ Failed to initialize Razorpay:", err.message);
  }
} else {
  console.log("🧪 Razorpay Key/Secret not configured. Running Digital Store in sandbox/mock mode.");
}

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET ALL DIGITAL PRODUCTS
// ──────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const { category, type, sort, query } = req.query;

    const filter = { status: "active" };

    if (category && category !== "all") {
      filter.category = category.toString().toLowerCase();
    }

    if (type && type !== "all") {
      filter.type = type.toString().toLowerCase();
    }

    if (query) {
      filter.title = { $regex: query.toString(), $options: "i" };
    }

    let sortOptions = { createdAt: -1 }; // Default: Newest
    if (sort === "popular") {
      sortOptions = { downloadCount: -1 };
    } else if (sort === "rating") {
      sortOptions = { averageRating: -1 };
    } else if (sort === "price-low") {
      sortOptions = { price: 1 };
    } else if (sort === "price-high") {
      sortOptions = { price: -1 };
    }

    const products = await DigitalProduct.find(filter)
      .select("-filePath") // Hide secure file path from client
      .sort(sortOptions);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: SERVE COVER IMAGES SECURELY
// ──────────────────────────────────────────────────────────────────────────────
router.get("/image/:filename", async (req, res, next) => {
  try {
    const { filename } = req.params;
    const ext = path.extname(filename).toLowerCase();
    const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"];
    if (!allowedExtensions.includes(ext)) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    // Check if the image exists in MongoDB (Render ephemeral disk workaround)
    const product = await DigitalProduct.findOne({ imageUrl: new RegExp(filename, "i") });
    if (product && product.coverImageBuffer) {
      res.setHeader("Content-Type", product.coverImageMimeType || "image/webp");
      res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
      return res.send(product.coverImageBuffer);
    }

    // If file does not exist locally and is not in DB, redirect to live site
    res.redirect(`https://smart-picks-india.onrender.com/api/v1/digital-store/image/${filename}`);
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET SINGLE DIGITAL PRODUCT DETAILS
// ──────────────────────────────────────────────────────────────────────────────
router.get("/product/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.headers["x-user-id"] || null; // Optional user identifier from frontend middleware

    const product = await DigitalProduct.findOne({ slug, status: "active" });
    if (!product) {
      return res.status(404).json({ success: false, message: "Digital product not found." });
    }

    // Clean sensitive properties before returning
    const cleanedProduct = product.toObject();
    delete cleanedProduct.filePath;

    let hasAccess = false;
    let isBookmarked = false;
    let purchaseRecord = null;

    if (product.type === "free") {
      hasAccess = true;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      // Check if product is favorited
      const fav = await Favorite.findOne({ userId, productId: product._id });
      isBookmarked = !!fav;

      // Check if user has purchased it (for paid/freemium)
      const purchase = await Purchase.findOne({
        userId,
        productId: product._id,
        status: "completed",
      });

      if (purchase) {
        hasAccess = true;
        purchaseRecord = {
          downloadCount: purchase.downloadCount,
          secureToken: purchase.secureToken,
          purchasedAt: purchase.updatedAt,
        };
      }
    }

    res.status(200).json({
      success: true,
      product: cleanedProduct,
      hasAccess,
      isBookmarked,
      purchase: purchaseRecord,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// SECURE DOWNLOAD STREAMS
// ──────────────────────────────────────────────────────────────────────────────

// Route 1: Download Paid/Freemium Product via Secure Token
router.get("/download/:token", async (req, res, next) => {
  try {
    const { token } = req.params;

    const purchase = await Purchase.findOne({ secureToken: token, status: "completed" })
      .populate("productId")
      .populate("userId");

    if (!purchase) {
      return res.status(404).json({ success: false, message: "Invalid or expired download link." });
    }

    const product = purchase.productId;
    if (!product || product.status !== "active") {
      return res.status(404).json({ success: false, message: "Product is no longer active." });
    }

    // Validate download limit
    if (product.downloadLimit > 0 && purchase.downloadCount >= product.downloadLimit) {
      return res.status(403).json({
        success: false,
        message: `Maximum download limit (${product.downloadLimit}) reached for this file.`,
      });
    }

    const filePath = product.filePath;
    if (filePath && fs.existsSync(filePath)) {
      // Increment download metrics
      purchase.downloadCount += 1;
      await purchase.save();

      product.downloadCount += 1;
      await product.save();

      // Log history
      const history = new DownloadHistory({
        userId: purchase.userId._id,
        productId: product._id,
        purchaseId: purchase._id,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
        userAgent: req.headers["user-agent"] || "",
      });
      await history.save();

      const fileBasename = path.basename(filePath);
      return res.download(filePath, fileBasename);
    }

    // Fallback: Check if stored in MongoDB as a binary buffer
    if (product.fileBuffer) {
      purchase.downloadCount += 1;
      await purchase.save();

      product.downloadCount += 1;
      await product.save();

      const history = new DownloadHistory({
        userId: purchase.userId._id,
        productId: product._id,
        purchaseId: purchase._id,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
        userAgent: req.headers["user-agent"] || "",
      });
      await history.save();

      res.setHeader("Content-Disposition", `attachment; filename="${product.fileOriginalName || 'resource.pdf'}"`);
      res.setHeader("Content-Type", product.fileMimeType || "application/octet-stream");
      return res.send(product.fileBuffer);
    }

    // Otherwise redirect to the live site to download it
    return res.redirect(`https://smart-picks-india.onrender.com/api/v1/digital-store/download/${token}`);
  } catch (err) {
    next(err);
  }
});

// Route 2: Download Free Product (Requires Authentication)
router.get("/download-free/:id", protect, async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await DigitalProduct.findById(id);
    if (!product || product.status !== "active") {
      return res.status(404).json({ success: false, message: "Resource not found or inactive." });
    }

    if (product.type !== "free" && product.price > 0) {
      return res.status(403).json({ success: false, message: "This is a paid resource." });
    }

    const filePath = product.filePath;
    if (filePath && fs.existsSync(filePath)) {
      // Increment count
      product.downloadCount += 1;
      await product.save();

      // Log history
      const history = new DownloadHistory({
        userId: req.user._id,
        productId: product._id,
        purchaseId: null,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
        userAgent: req.headers["user-agent"] || "",
      });
      await history.save();

      const fileBasename = path.basename(filePath);
      return res.download(filePath, fileBasename);
    }

    // Fallback: Check if stored in MongoDB as a binary buffer
    if (product.fileBuffer) {
      product.downloadCount += 1;
      await product.save();

      const history = new DownloadHistory({
        userId: req.user._id,
        productId: product._id,
        purchaseId: null,
        ipAddress: req.ip || req.headers["x-forwarded-for"] || "",
        userAgent: req.headers["user-agent"] || "",
      });
      await history.save();

      res.setHeader("Content-Disposition", `attachment; filename="${product.fileOriginalName || 'resource.pdf'}"`);
      res.setHeader("Content-Type", product.fileMimeType || "application/octet-stream");
      return res.send(product.fileBuffer);
    }

    // Otherwise redirect to the live site
    return res.redirect(`https://smart-picks-india.onrender.com/api/v1/digital-store/download-free/${id}`);
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PROTECTED API ENDPOINTS (REQUIRING LOGIN)
// ──────────────────────────────────────────────────────────────────────────────
router.use(protect);

// 1. Toggle Favorite
router.post("/favorite/:id", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;

    const product = await DigitalProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const existingFav = await Favorite.findOne({ userId, productId });

    if (existingFav) {
      await Favorite.deleteOne({ _id: existingFav._id });
      return res.status(200).json({ success: true, isBookmarked: false, message: "Removed from favorites." });
    } else {
      const fav = new Favorite({ userId, productId });
      await fav.save();
      return res.status(200).json({ success: true, isBookmarked: true, message: "Added to favorites." });
    }
  } catch (err) {
    next(err);
  }
});

// 2. Submit Rating/Review
router.post("/product/:id/review", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
    }

    const product = await DigitalProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    // Verify access: must either be a free product or user must have purchased it
    if (product.type !== "free") {
      const purchase = await Purchase.findOne({
        userId,
        productId,
        status: "completed",
      });
      if (!purchase) {
        return res.status(403).json({
          success: false,
          message: "You must purchase this product before writing a review.",
        });
      }
    }

    // Remove existing review if present to allow editing
    product.ratings = product.ratings.filter((r) => !r.userId.equals(userId));

    // Append new review
    product.ratings.push({
      userId,
      userName: req.user.name,
      rating: ratingNum,
      review: review || "",
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review submitted successfully!",
      averageRating: product.averageRating,
      ratings: product.ratings,
    });
  } catch (err) {
    next(err);
  }
});

// 3. Initiate Checkout Order
router.post("/checkout/order", async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const product = await DigitalProduct.findById(productId);
    if (!product || product.status !== "active") {
      return res.status(404).json({ success: false, message: "Product not found or unavailable." });
    }

    if (product.price <= 0 || product.type === "free") {
      return res.status(400).json({ success: false, message: "This product is free. No checkout needed." });
    }

    // Check if already purchased
    const existingPurchase = await Purchase.findOne({ userId, productId, status: "completed" });
    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message: "You have already purchased this product. Go to your dashboard to download.",
      });
    }

    const amountInPaise = Math.round(product.price * 100);

    let orderId = `sandbox_order_${crypto.randomBytes(8).toString("hex")}`;

    if (!IS_SANDBOX && razorpay) {
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `receipt_prod_${product._id.toString().substring(0, 10)}`,
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Save pending purchase
    const purchase = new Purchase({
      userId,
      productId: product._id,
      amount: product.price,
      orderId,
      status: "pending",
    });
    await purchase.save();

    res.status(200).json({
      success: true,
      sandbox: IS_SANDBOX,
      keyId: IS_SANDBOX ? "sandbox_key" : RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: "INR",
      orderId,
      product: {
        title: product.title,
        description: product.description.slice(0, 120),
        image: product.imageUrl,
        price: product.price,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 4. Verify Payment Order
router.post("/checkout/verify", async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;
    const userId = req.user._id;

    const purchase = await Purchase.findOne({ userId, orderId, status: "pending" }).populate("productId");
    if (!purchase) {
      return res.status(404).json({ success: false, message: "Purchase order not found." });
    }

    let isSuccess = false;

    if (IS_SANDBOX) {
      // Auto-approve payments in Sandbox Mode
      isSuccess = true;
      purchase.paymentId = paymentId || `sandbox_payment_${crypto.randomBytes(8).toString("hex")}`;
    } else {
      // Production Razorpay Signature Verification
      if (!signature || !paymentId) {
        return res.status(400).json({ success: false, message: "Missing signature or payment ID." });
      }

      const generatedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      if (generatedSignature === signature) {
        isSuccess = true;
        purchase.paymentId = paymentId;
      }
    }

    if (isSuccess) {
      purchase.status = "completed";
      purchase.secureToken = crypto.randomUUID(); // Secure download link validator
      await purchase.save();

      // Trigger Email Confirmation in background
      try {
        const downloadUrl = `${req.protocol}://${req.get("host")}/api/v1/digital-store/download/${purchase.secureToken}`;
        await sendEmail({
          to: req.user.email,
          subject: `SmartPicks India — Order Confirmed: ${purchase.productId.title}`,
          html: `
            <h2>Thank you for your purchase!</h2>
            <p>Hi ${req.user.name},</p>
            <p>Your payment of ₹${purchase.amount} for <strong>${purchase.productId.title}</strong> has been successfully processed.</p>
            <p>Click the secure link below to download your file:</p>
            <p><a href="${downloadUrl}" style="background-color: #df3838; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; margin-top: 10px;">Download Your Resource</a></p>
            <p>This download link can also be retrieved inside your personal <a href="https://smart-picks-india.vercel.app/dashboard">SmartPicks Dashboard</a> under the Purchases section.</p>
            <p>Thanks,<br/>SmartPicks India Team</p>
          `,
        });
      } catch (emailErr) {
        console.warn("⚠️ Purchase confirmation email failed to send:", emailErr.message);
      }

      res.status(200).json({
        success: true,
        message: "Payment verified and order completed successfully!",
        secureToken: purchase.secureToken,
      });
    } else {
      purchase.status = "failed";
      await purchase.save();
      res.status(400).json({ success: false, message: "Payment verification failed." });
    }
  } catch (err) {
    next(err);
  }
});

// 5. Get User Purchases
router.get("/my-purchases", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const purchases = await Purchase.find({ userId, status: "completed" })
      .populate("productId")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      purchases: purchases.map((p) => ({
        id: p._id,
        productId: p.productId?._id,
        title: p.productId?.title || "Unknown Product",
        slug: p.productId?.slug || "",
        category: p.productId?.category || "",
        imageUrl: p.productId?.imageUrl || "",
        price: p.amount,
        secureToken: p.secureToken,
        downloadCount: p.downloadCount,
        purchasedAt: p.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// 6. Get User Favorites
router.get("/my-favorites", async (req, res, next) => {
  try {
    const userId = req.user._id;
    const favorites = await Favorite.find({ userId }).populate("productId");

    res.status(200).json({
      success: true,
      favorites: favorites
        .filter((f) => f.productId && f.productId.status === "active")
        .map((f) => ({
          id: f._id,
          productId: f.productId._id,
          title: f.productId.title,
          slug: f.productId.slug,
          category: f.productId.category,
          imageUrl: f.productId.imageUrl,
          price: f.productId.price,
          type: f.productId.type,
          averageRating: f.productId.averageRating,
        })),
    });
  } catch (err) {
    next(err);
  }
});

export default router;

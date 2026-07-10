import "./loadEnv.js";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

// Routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import alertsRouter from "./routes/alerts.js";
import assistantRouter from "./routes/assistant.js";
import dealsRouter from "./routes/deals.js";
import adminRouter from "./routes/admin.js";
import digitalStoreRouter from "./routes/digitalStore.js";
import studentHubRouter from "./routes/studentHub.js";
import newsletterRouter from "./routes/newsletter.js";
import affiliateRouter from "./routes/affiliate.js";
import aiRouter from "./routes/ai.js";
import blogRouter from "./routes/blog.js";
import roadmapProgressRouter from "./routes/roadmapProgress.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { syncProductPrices, syncProductsFromCatalog } from "./utils/priceSync.js";
import { initPriceSyncCron } from "./jobs/priceSync.js";

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-picks-auth";

// ──────────────────────────────────────────────────────────────────────────────
// CUSTOM SECURITY MIDDLEWARES
// ──────────────────────────────────────────────────────────────────────────────

// Custom NoSQL query injection sanitization middleware
function sanitizeMongo(req, res, next) {
  const clean = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          clean(obj[key]);
        }
      }
    }
  };
  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
}

// HTTP Parameter Pollution prevention middleware
function preventHpp(req, res, next) {
  if (req.query && typeof req.query === "object") {
    for (const key in req.query) {
      if (Array.isArray(req.query[key])) {
        // Safe fallback: extract last query value to prevent array type crashes
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    }
  }
  next();
}

// ──────────────────────────────────────────────────────────────────────────────
// MIDDLEWARES
// ──────────────────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(sanitizeMongo);
app.use(preventHpp);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or curl requests (origin is undefined)
      const isAllowed =
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production" ||
        origin.endsWith(".vercel.app") ||
        /^https?:\/\/localhost:\d+$/.test(origin) ||
        /^https?:\/\/127\.0\.0\.1:\d+$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "5mb" })); // limit body size to 5mb to support base64 avatar uploads
app.use(cookieParser());

// Trust proxy (required for secure cookies and accurate rate limiter IP tracking in production)
app.set("trust proxy", 1);
// Apply general API rate limiter
app.use("/api", apiLimiter);

app.use((req, res, next) => {
  console.log(`[API Request]: ${req.method} ${req.originalUrl}`);
  next();
});

// ──────────────────────────────────────────────────────────────────────────────
// ROUTES
// ──────────────────────────────────────────────────────────────────────────────
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/alerts", alertsRouter);
app.use("/api/v1/assistant", assistantRouter);
app.use("/api/v1/deals", dealsRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/digital-store", digitalStoreRouter);
app.use("/api/v1/student-hub", studentHubRouter);
app.use("/api/v1/newsletter", newsletterRouter);
app.use("/api/v1/affiliate", affiliateRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/roadmaps", roadmapProgressRouter);


// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and running - version sync-now-v1",
    timestamp: new Date(),
    env: process.env.NODE_ENV || "development",
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Resource not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 Error caught by Express:", err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "An unexpected server error occurred",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// DATABASE CONNECTION & START
// ──────────────────────────────────────────────────────────────────────────────
console.log("🔌 Connecting to MongoDB...");
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected successfully.");

    // ── Ensure critical indexes exist ──────────────────────────────────────────
    // These are no-ops if indexes already exist — safe to run on every restart
    try {
      const db = mongoose.connection.db;
      // Product slug lookup (most common query — product detail pages)
      await db.collection("products").createIndex({ slug: 1 }, { unique: true, background: true });
      // Price history: fetch latest price for a product
      await db.collection("pricehistories").createIndex({ slug: 1, recordedAt: -1 }, { background: true });
      // Price alerts: find active alerts for a product slug on drop
      await db.collection("pricealerts").createIndex({ slug: 1, isActive: 1 }, { background: true });
      // Session: refresh token revocation check on every authenticated request
      await db.collection("sessions").createIndex({ refreshToken: 1 }, { background: true });
      // Session: auto-delete expired sessions via TTL
      await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, background: true });
      // User: email uniqueness + login lookup
      await db.collection("users").createIndex({ email: 1 }, { unique: true, background: true });
      console.log("✅ MongoDB indexes verified.");
    } catch (indexErr) {
      console.warn("⚠️ Index creation warning (non-fatal):", indexErr.message);
    }
    // ──────────────────────────────────────────────────────────────────────────

    // Run catalog and price synchronization on startup

    syncProductsFromCatalog()
      .then(() => syncProductPrices())
      .catch((err) => {
        console.error("❌ Initial catalog/price sync failed:", err.message);
      });
    // Start price history cron logger daemon
    initPriceSyncCron();

    app.listen(PORT, () => {
      console.log(`🚀 Express server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("ℹ️ Please make sure MongoDB is running locally, or configure MONGODB_URI in your environment.");
    process.exit(1);
  });

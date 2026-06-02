import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routers
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";
import alertsRouter from "./routes/alerts.js";
import assistantRouter from "./routes/assistant.js";
import dealsRouter from "./routes/deals.js";
import adminRouter from "./routes/admin.js";
import digitalStoreRouter from "./routes/digitalStore.js";
import studentHubRouter from "./routes/studentHub.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { syncProductPrices } from "./utils/priceSync.js";

// Initialize environment variables from root first, then locally
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config(); // fallbacks

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-picks-auth";

// ──────────────────────────────────────────────────────────────────────────────
// MIDDLEWARES
// ──────────────────────────────────────────────────────────────────────────────
app.use(helmet());

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

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy and running",
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
  .then(() => {
    console.log("✅ MongoDB Connected successfully.");
    // Run price synchronization on startup
    syncProductPrices().catch((err) => {
      console.error("❌ Initial price sync failed:", err.message);
    });

    app.listen(PORT, () => {
      console.log(`🚀 Express server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("ℹ️ Please make sure MongoDB is running locally, or configure MONGODB_URI in your environment.");
    process.exit(1);
  });

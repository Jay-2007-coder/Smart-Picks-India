import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { generateAccessToken, setAuthCookies, clearAuthCookies } from "../utils/tokens.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123456_key";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret_123456_key";

export async function protect(req, res, next) {
  const { accessToken, refreshToken } = req.cookies;

  if (!accessToken) {
    // If no access token, try to refresh using the refresh token
    return await handleTokenRefresh(req, res, next, refreshToken);
  }

  try {
    const decoded = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (user.isLocked()) {
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    if (user.hubPlan === "pro" && !user.hubPlanExpiresAt) {
      user.hubPlanExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    if (user.hubPlan === "pro" && user.role !== "admin" && user.hubPlanExpiresAt && new Date(user.hubPlanExpiresAt) < new Date()) {
      user.hubPlan = "free";
      user.hubPlanExpiresAt = null;
      await user.save();
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      // If access token is expired, try to refresh using the refresh token
      return await handleTokenRefresh(req, res, next, refreshToken);
    }
    
    // Other verification errors (e.g. invalid signature)
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: "Invalid session token" });
  }
}

async function handleTokenRefresh(req, res, next, refreshToken) {
  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // 2. Check if the refresh token is registered in the database
    const dbSession = await Session.findOne({ userId: decoded.userId, refreshToken });
    if (!dbSession) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: "Session expired or revoked" });
    }

    // 3. Find user and check statuses
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (user.isLocked()) {
      clearAuthCookies(res);
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    if (user.hubPlan === "pro" && !user.hubPlanExpiresAt) {
      user.hubPlanExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
    }

    if (user.hubPlan === "pro" && user.role !== "admin" && user.hubPlanExpiresAt && new Date(user.hubPlanExpiresAt) < new Date()) {
      user.hubPlan = "free";
      user.hubPlanExpiresAt = null;
      await user.save();
    }

    // 4. Generate new access token
    const newAccessToken = generateAccessToken(user._id.toString());

    // 5. Update cookie (since we are on lax/httpOnly, this handles refresh automatically)
    // We retain the existing refresh token cookie, but rewrite the cookies header
    // Check if original refresh cookie had an expiration or was a session cookie
    const hasExpiry = !!dbSession.expiresAt;
    setAuthCookies(res, newAccessToken, refreshToken, hasExpiry);

    // 6. Set user on req and proceed
    req.user = user;
    return next();
  } catch (err) {
    clearAuthCookies(res);
    return res.status(401).json({ success: false, message: "Session expired, please login again" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Access denied. Admin role required." });
  }
  next();
}

import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { protect } from "../middleware/auth.js";
import { updateProfileSchema, changePasswordSchema, validate } from "../utils/validation.js";

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

// ──────────────────────────────────────────────────────────────────────────────
// 1. GET / UPDATE PROFILE
// ──────────────────────────────────────────────────────────────────────────────
router.put("/profile", validate(updateProfileSchema), async (req, res, next) => {
  try {
    const { name, phone, telegramChatId } = req.body;
    const user = req.user; // populated by protect middleware

    if (name) user.name = name;
    
    if (phone !== undefined) {
      if (phone === "") {
        user.phone = undefined;
        user.isPhoneVerified = false;
      } else if (phone !== user.phone) {
        // Verify unique phone
        const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: "Phone number is already in use by another account",
            errors: { phone: ["Phone number is already in use by another account"] },
          });
        }
        user.phone = phone;
        user.isPhoneVerified = false; // Reset phone verification since phone changed
      }
    }

    if (telegramChatId !== undefined) {
      user.telegramChatId = telegramChatId === "" ? null : telegramChatId;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role,
        telegramChatId: user.telegramChatId,
        hubPlan: user.hubPlan,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. CHANGE PASSWORD
// ──────────────────────────────────────────────────────────────────────────────
router.put("/change-password", validate(changePasswordSchema), async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Find user with password selected (protect excludes it)
    const user = await User.findById(req.user._id);

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "Your account does not have a local password (registered via Google/GitHub).",
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password",
        errors: { oldPassword: ["Incorrect current password"] },
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as old password",
        errors: { newPassword: ["New password must be different from current password"] },
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Optionally revoke other active sessions (keep current session)
    const currentRefreshToken = req.cookies.refreshToken;
    await Session.deleteMany({ userId: user._id, refreshToken: { $ne: currentRefreshToken } });

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. PROFILE IMAGE UPLOAD (Base64 or URL)
// ──────────────────────────────────────────────────────────────────────────────
router.post("/profile/upload", async (req, res, next) => {
  try {
    const { image } = req.body; // Can be base64 string or url string
    if (!image) {
      return res.status(400).json({ success: false, message: "Image data is required" });
    }

    // Save image path or raw data
    const user = req.user;
    user.profileImage = image;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. LIST SESSIONS
// ──────────────────────────────────────────────────────────────────────────────
router.get("/sessions", async (req, res, next) => {
  try {
    const sessions = await Session.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    
    // Map sessions to UI format (flagging which one is current)
    const mappedSessions = sessions.map((s) => ({
      id: s._id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      isCurrent: s.refreshToken === req.cookies.refreshToken,
      lastActive: s.updatedAt,
    }));

    // Retrieve login history from user details
    const user = await User.findById(req.user._id).select("loginHistory");

    res.status(200).json({
      success: true,
      sessions: mappedSessions,
      loginHistory: user.loginHistory.slice(-10).reverse(), // Last 10 items
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. REVOKE SPECIFIC SESSION
// ──────────────────────────────────────────────────────────────────────────────
router.delete("/sessions/:sessionId", async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const sessionToDelete = await Session.findOne({ _id: sessionId, userId: req.user._id });

    if (!sessionToDelete) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Check if user is deleting their own current session
    const isCurrent = sessionToDelete.refreshToken === req.cookies.refreshToken;

    await Session.deleteOne({ _id: sessionId });

    if (isCurrent) {
      // Clear cookies to force logout
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("refreshToken", { path: "/" });
    }

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
      isLoggedOut: isCurrent,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. REVOKE ALL OTHER SESSIONS
// ──────────────────────────────────────────────────────────────────────────────
router.delete("/sessions", async (req, res, next) => {
  try {
    const currentRefreshToken = req.cookies.refreshToken;
    
    // Delete all sessions except the current active session
    const result = await Session.deleteMany({
      userId: req.user._id,
      refreshToken: { $ne: currentRefreshToken },
    });

    res.status(200).json({
      success: true,
      message: `Successfully terminated ${result.deletedCount} other session(s).`,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. UPGRADE TO PRO (Razorpay mock or direct signature verification)
// ──────────────────────────────────────────────────────────────────────────────
router.post("/upgrade-pro", async (req, res, next) => {
  try {
    const user = req.user;
    
    // Simulate successful payment verification
    const { razorpay_payment_id } = req.body;
    if (razorpay_payment_id) {
      console.log(`Verifying payment ${razorpay_payment_id} for user ${user._id}`);
    }

    user.hubPlan = "pro";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Congratulations! You have upgraded to Student Hub Pro successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hubPlan: user.hubPlan,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 8. GET REFERRALS DATA
// ──────────────────────────────────────────────────────────────────────────────
router.get("/referrals", async (req, res, next) => {
  try {
    const user = req.user;
    
    const referredUsers = await User.find({ referredBy: user._id })
      .select("name email createdAt isEmailVerified")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      referralCode: user.referralCode,
      walletBalance: user.walletBalance || 0,
      referredUsers: referredUsers.map(u => ({
        name: u.name,
        email: u.email.substring(0, 3) + "***" + u.email.substring(u.email.indexOf("@")),
        joinedAt: u.createdAt,
        verified: u.isEmailVerified
      }))
    });
  } catch (err) {
    next(err);
  }
});

export default router;

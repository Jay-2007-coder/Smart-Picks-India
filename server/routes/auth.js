import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Session from "../models/Session.js";
import Otp from "../models/Otp.js";
import Token from "../models/Token.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  requestOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate,
} from "../utils/validation.js";
import { generateAccessToken, generateRefreshToken, setAuthCookies, clearAuthCookies } from "../utils/tokens.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";
import { sendOtpSms } from "../utils/sms.js";

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Helper to hash token for secure DB storage
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. REGISTER
// ──────────────────────────────────────────────────────────────────────────────
router.post("/register", authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, phone, password, refCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
        errors: { email: ["Email is already registered"] },
      });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone number is already registered",
          errors: { phone: ["Phone number is already registered"] },
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Handle referral code checks
    let referrer = null;
    if (refCode) {
      referrer = await User.findOne({ referralCode: refCode.trim() });
    }

    // Generate unique referral code for the new user
    const generatedRefCode = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toLowerCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create user
    const user = new User({
      name,
      email,
      phone: phone || undefined,
      password: hashedPassword,
      isEmailVerified: true, // Auto-verify email to allow immediate login
      isPhoneVerified: false,
      referralCode: generatedRefCode,
      referredBy: referrer ? referrer._id : null,
    });

    await user.save();

    // Credit ₹50 to the referrer
    if (referrer) {
      referrer.walletBalance = (referrer.walletBalance || 0) + 50;
      await referrer.save();
    }

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);
    
    const tokenRecord = new Token({
      userId: user._id,
      tokenHash: verificationTokenHash,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    await tokenRecord.save();

    // Send email (asynchronously)
    sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error("Email send failure during registration:", err.message);
    });

    res.status(201).json({
      success: true,
      message: "Registration successful. You can now login.",
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. VERIFY EMAIL
// ──────────────────────────────────────────────────────────────────────────────
router.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const verificationTokenHash = hashToken(token);
    const tokenRecord = await Token.findOne({
      tokenHash: verificationTokenHash,
      type: "email_verification",
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Verification link is invalid or expired" });
    }

    const user = await User.findById(tokenRecord.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isEmailVerified = true;
    await user.save();

    // Remove token record
    await Token.deleteOne({ _id: tokenRecord._id });

    res.status(200).json({ success: true, message: "Email verified successfully. You can now login." });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 3. RESEND VERIFICATION EMAIL
// ──────────────────────────────────────────────────────────────────────────────
router.post("/resend-verification", authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: "If the email is registered, we have sent a verification link." });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "This email is already verified" });
    }

    // Delete existing tokens if any
    await Token.deleteMany({ userId: user._id, type: "email_verification" });

    // Generate Verification Token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenHash = hashToken(verificationToken);

    const tokenRecord = new Token({
      userId: user._id,
      tokenHash: verificationTokenHash,
      type: "email_verification",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await tokenRecord.save();

    sendVerificationEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error("Resend verification email failure:", err.message);
    });

    res.status(200).json({ success: true, message: "Verification email resent successfully." });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 4. SEND OTP
// ──────────────────────────────────────────────────────────────────────────────
router.post("/send-otp", authLimiter, validate(requestOtpSchema), async (req, res, next) => {
  try {
    const { phone, purpose } = req.body;

    // Checks based on purpose
    const existingUser = await User.findOne({ phone });
    if (purpose === "register" && existingUser) {
      return res.status(400).json({ success: false, message: "Phone number already in use" });
    }
    if (purpose === "login" && !existingUser) {
      return res.status(404).json({ success: false, message: "No account found with this phone number" });
    }

    // Check OTP cooldown
    const existingOtp = await Otp.findOne({ phone, purpose });
    if (existingOtp && existingOtp.resendCooldownUntil > new Date()) {
      const waitSeconds = Math.ceil((existingOtp.resendCooldownUntil.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
      });
    }

    // Delete existing OTP records for this phone/purpose
    await Otp.deleteMany({ phone, purpose });

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n[AUTH] Generated OTP for ${phone}: ${otpCode}\n`);
    const salt = await bcrypt.genSalt(10);
    const codeHash = await bcrypt.hash(otpCode, salt);

    const otpRecord = new Otp({
      phone,
      codeHash,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      resendCooldownUntil: new Date(Date.now() + 60 * 1000), // 60 seconds cooldown
    });

    await otpRecord.save();

    // Send SMS
    await sendOtpSms(phone, otpCode);

    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 5. LOGIN
// ──────────────────────────────────────────────────────────────────────────────
router.post("/login", authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password, phone, code, rememberMe } = req.body;
    let user;

    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";

    if (email) {
      // Email login
      user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      // Check lockout status
      if (user.isLocked()) {
        const lockoutRemaining = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000 / 60);
        return res.status(403).json({
          success: false,
          message: `Account temporarily locked due to multiple failed login attempts. Try again in ${lockoutRemaining} minutes.`,
        });
      }

      // If user signed up via social and doesn't have password, deny password login
      if (!user.password) {
        return res.status(400).json({
          success: false,
          message: "Please log in using Google/GitHub as you registered using social sign-in.",
        });
      }

      // Verify Password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        // Increment failed attempts
        user.failedLoginAttempts += 1;
        user.loginHistory.push({ ipAddress, device: userAgent, status: "failed" });

        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
          user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
          user.failedLoginAttempts = 0; // Reset attempts to avoid infinite lockout checks
          await user.save();
          return res.status(403).json({
            success: false,
            message: `Too many failed attempts. Your account has been locked for 15 minutes.`,
          });
        }

        await user.save();
        return res.status(401).json({
          success: false,
          message: `Invalid email or password. Attempt ${user.failedLoginAttempts}/${MAX_FAILED_ATTEMPTS}`,
        });
      }

      // Auto-verify if not already verified
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save();
      }
    } else if (phone) {
      // Phone Login (Verify OTP)
      user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({ success: false, message: "No user found with this phone number" });
      }

      const otpRecord = await Otp.findOne({ phone, purpose: "login" });
      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "OTP code has expired or is invalid" });
      }

      const isOtpMatch = await bcrypt.compare(code, otpRecord.codeHash);
      if (!isOtpMatch) {
        return res.status(400).json({ success: false, message: "Invalid OTP code" });
      }

      // Success, delete the OTP record
      await Otp.deleteOne({ _id: otpRecord._id });

      // Auto-verify phone on successful login
      user.isPhoneVerified = true;
    }

    // Success Actions: Reset failed attempts, log history
    user.failedLoginAttempts = 0;
    user.lockoutUntil = null;
    user.loginHistory.push({ ipAddress, device: userAgent, status: "success" });
    if (user.hubPlan === "pro" && !user.hubPlanExpiresAt) {
      user.hubPlanExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    if (user.hubPlan === "pro" && user.role !== "admin" && user.hubPlanExpiresAt && new Date(user.hubPlanExpiresAt) < new Date()) {
      user.hubPlan = "free";
      user.hubPlanExpiresAt = null;
    }
    await user.save();

    // Create session
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Record session in Database for revocation tracking
    const sessionRecord = new Session({
      userId: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await sessionRecord.save();

    // Cookies
    setAuthCookies(res, accessToken, refreshToken, rememberMe);

    res.status(200).json({
      success: true,
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
        hubPlanExpiresAt: user.hubPlanExpiresAt,
        xp: user.xp,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 6. MOCK SOCIAL LOGIN (SIMULATED OAUTH REDIRECTS FOR LOCAL DEV)
// ──────────────────────────────────────────────────────────────────────────────
// Helper to find or create social login user
async function processSocialLoginUser({ provider, accountId, email, name, avatarUrl, req }) {
  const userAgent = req.headers["user-agent"] || "Unknown";
  const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";

  // 1. Check if user already has this specific social account linked
  let user = await User.findOne({
    "socialAccounts.provider": provider,
    "socialAccounts.accountId": accountId,
  });

  if (!user) {
    // 2. Check if a user exists with the same email
    user = await User.findOne({ email });

    if (user) {
      // Link social account to existing profile (Account Linking)
      user.socialAccounts.push({ provider, accountId, email, avatarUrl });
      if (avatarUrl && !user.profileImage) {
        user.profileImage = avatarUrl;
      }
      await user.save();
    } else {
      // 3. Create a brand new user
      const generatedRefCode = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toLowerCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
      user = new User({
        name,
        email,
        profileImage: avatarUrl || null,
        isEmailVerified: true, // Social accounts are trusted & pre-verified
        socialAccounts: [{ provider, accountId, email, avatarUrl }],
        referralCode: generatedRefCode,
      });
      await user.save();
    }
  }

  // Record login
  user.loginHistory.push({ ipAddress, device: userAgent, status: "success" });
  if (user.hubPlan === "pro" && !user.hubPlanExpiresAt) {
    user.hubPlanExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
  if (user.hubPlan === "pro" && user.role !== "admin" && user.hubPlanExpiresAt && new Date(user.hubPlanExpiresAt) < new Date()) {
    user.hubPlan = "free";
    user.hubPlanExpiresAt = null;
  }
  await user.save();
  return user;
}

// ──────────────────────────────────────────────────────────────────────────────
// 6. MOCK SOCIAL LOGIN (SIMULATED OAUTH REDIRECTS FOR LOCAL DEV)
// ──────────────────────────────────────────────────────────────────────────────
router.post("/social-login", async (req, res, next) => {
  try {
    const { provider, accountId, email, name, avatarUrl } = req.body;
    if (!provider || !accountId || !email) {
      return res.status(400).json({ success: false, message: "Missing oauth parameters" });
    }

    const user = await processSocialLoginUser({ provider, accountId, email, name, avatarUrl, req });

    // Create session tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    const sessionRecord = new Session({
      userId: user._id,
      refreshToken,
      userAgent: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip || req.connection.remoteAddress || "Unknown",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await sessionRecord.save();

    // Cookies
    setAuthCookies(res, accessToken, refreshToken, true);

    res.status(200).json({
      success: true,
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
        hubPlanExpiresAt: user.hubPlanExpiresAt,
        xp: user.xp,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GOOGLE OAUTH ───
router.get("/google", (req, res) => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const BACKEND_URL = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

  if (!GOOGLE_CLIENT_ID) {
    console.warn("⚠️ GOOGLE_CLIENT_ID is not configured. Falling back to mock registration.");
    return res.redirect(`${CLIENT_URL}/login?mock_provider=google`);
  }

  const redirectUri = `${CLIENT_URL}/api/v1/auth/google/callback`;
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent("profile email")}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(googleAuthUrl);
});

router.get("/google/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const BACKEND_URL = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

    if (!code) {
      return res.redirect(`${CLIENT_URL}/login?error=no_code_provided`);
    }

    const redirectUri = `${CLIENT_URL}/api/v1/auth/google/callback`;

    // Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return res.redirect(`${CLIENT_URL}/login?error=google_token_failed`);
    }

    // Fetch user info from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();
    if (!userResponse.ok || !userData.email) {
      console.error("Google user info fetch failed:", userData);
      return res.redirect(`${CLIENT_URL}/login?error=google_user_failed`);
    }

    const user = await processSocialLoginUser({
      provider: "google",
      accountId: userData.id,
      email: userData.email,
      name: userData.name || userData.email.split("@")[0],
      avatarUrl: userData.picture,
      req,
    });

    // Create session tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Record session
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    const sessionRecord = new Session({
      userId: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await sessionRecord.save();

    setAuthCookies(res, accessToken, refreshToken, true);

    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    next(err);
  }
});

// ─── GITHUB OAUTH ───
router.get("/github", (req, res) => {
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const BACKEND_URL = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

  if (!GITHUB_CLIENT_ID) {
    console.warn("⚠️ GITHUB_CLIENT_ID is not configured. Falling back to mock registration.");
    return res.redirect(`${CLIENT_URL}/login?mock_provider=github`);
  }

  const redirectUri = `${CLIENT_URL}/api/v1/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent("user:email")}`;

  res.redirect(githubAuthUrl);
});

router.get("/github/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
    const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

    if (!code) {
      return res.redirect(`${CLIENT_URL}/login?error=no_code_provided`);
    }

    // Exchange authorization code for token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("GitHub token exchange failed:", tokenData);
      return res.redirect(`${CLIENT_URL}/login?error=github_token_failed`);
    }

    // Fetch user profile from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${tokenData.access_token}`,
        "User-Agent": "SmartPicks-India-Auth",
      },
    });

    const userData = await userResponse.json();
    if (!userResponse.ok || !userData.id) {
      console.error("GitHub user info fetch failed:", userData);
      return res.redirect(`${CLIENT_URL}/login?error=github_user_failed`);
    }

    // Fetch user emails (since public email might be null)
    let email = userData.email;
    if (!email) {
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${tokenData.access_token}`,
          "User-Agent": "SmartPicks-India-Auth",
        },
      });
      const emailsData = await emailsResponse.json();
      if (emailsResponse.ok && Array.isArray(emailsData)) {
        const primaryEmail = emailsData.find(e => e.primary && e.verified) || emailsData[0];
        if (primaryEmail) {
          email = primaryEmail.email;
        }
      }
    }

    if (!email) {
      email = `${userData.login}@users.noreply.github.com`;
    }

    const user = await processSocialLoginUser({
      provider: "github",
      accountId: String(userData.id),
      email,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      req,
    });

    // Create session tokens
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    // Record session
    const userAgent = req.headers["user-agent"] || "Unknown";
    const ipAddress = req.ip || req.connection.remoteAddress || "Unknown";
    const sessionRecord = new Session({
      userId: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await sessionRecord.save();

    setAuthCookies(res, accessToken, refreshToken, true);

    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    next(err);
  }
});

// ─── MICROSOFT OAUTH ───
router.get("/microsoft", (req, res) => {
  const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
  return res.redirect(`${CLIENT_URL}/login?mock_provider=microsoft`);
});

// ──────────────────────────────────────────────────────────────────────────────
// 7. FORGOT PASSWORD
// ──────────────────────────────────────────────────────────────────────────────
router.post("/forgot-password", authLimiter, validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Avoid user enumeration: return success even if user does not exist
      return res.status(200).json({
        success: true,
        message: "If the email is registered, a password reset link has been sent.",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created via social login. Please use Google/GitHub.",
      });
    }

    // Delete existing reset tokens
    await Token.deleteMany({ userId: user._id, type: "password_reset" });

    // Create secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashToken(resetToken);

    const tokenRecord = new Token({
      userId: user._id,
      tokenHash: resetTokenHash,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour expiry
    });
    await tokenRecord.save();

    // Send email
    sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) => {
      console.error("Password reset email send failure:", err.message);
    });

    res.status(200).json({
      success: true,
      message: "If the email is registered, a password reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 8. RESET PASSWORD
// ──────────────────────────────────────────────────────────────────────────────
router.post("/reset-password", authLimiter, validate(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const resetTokenHash = hashToken(token);
    const tokenRecord = await Token.findOne({
      tokenHash: resetTokenHash,
      type: "password_reset",
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Password reset link is invalid or expired" });
    }

    const user = await User.findById(tokenRecord.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as your current password",
      });
    }

    // Save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.failedLoginAttempts = 0; // Reset locking in case it was locked
    user.lockoutUntil = null;
    await user.save();

    // Revoke all existing sessions for safety after password change
    await Session.deleteMany({ userId: user._id });

    // Clean up reset token
    await Token.deleteOne({ _id: tokenRecord._id });

    res.status(200).json({ success: true, message: "Password reset successful. You can now login with your new password." });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 9. LOGOUT
// ──────────────────────────────────────────────────────────────────────────────
router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      // Remove specific refresh token session from DB
      await Session.deleteOne({ refreshToken });
    }

    clearAuthCookies(res);
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 10. CURRENT SESSION CHECK (ME)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      profileImage: req.user.profileImage,
      isEmailVerified: req.user.isEmailVerified,
      isPhoneVerified: req.user.isPhoneVerified,
      role: req.user.role,
      telegramChatId: req.user.telegramChatId,
      hubPlan: req.user.hubPlan,
      hubPlanExpiresAt: req.user.hubPlanExpiresAt,
      xp: req.user.xp,
    },
  });
});

export default router;

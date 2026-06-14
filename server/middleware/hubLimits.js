import User from "../models/User.js";

export async function checkHubLimits(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (user.hubPlan === "pro" && user.role !== "admin" && user.hubPlanExpiresAt && new Date(user.hubPlanExpiresAt) < new Date()) {
      user.hubPlan = "free";
      user.hubPlanExpiresAt = null;
      await user.save();
    }

    if (user.role === "admin" || user.hubPlan === "pro") {
      return next();
    }

    // Check if daily reset is needed (by checking calendar day)
    const todayStr = new Date().toDateString();
    const lastUpdateStr = new Date(user.updatedAt || user.createdAt).toDateString();

    let usage = user.hubUsage || 0;
    if (todayStr !== lastUpdateStr) {
      usage = 0;
      user.hubUsage = 0;
      await user.save();
    }

    if (req.method === "POST") {
      if (usage >= 3) {
        return res.status(403).json({
          success: false,
          limitReached: true,
          message: "You have reached your free daily limit of 3 AI assistance runs. Please upgrade to Pro for unlimited runs!"
        });
      }
      user.hubUsage = usage + 1;
      await user.save();
    }

    next();
  } catch (err) {
    next(err);
  }
}

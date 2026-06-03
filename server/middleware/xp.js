export const awardXp = async (req, res, next) => {
  if (req.user) {
    try {
      const xpGained = 10;
      req.user.xp = (req.user.xp || 0) + xpGained;
      await req.user.save();

      // Wrap res.json to inject XP feedback
      const originalJson = res.json;
      res.json = function (data) {
        if (data && typeof data === "object") {
          data.xpGained = xpGained;
          data.totalXp = req.user.xp;
        }
        return originalJson.call(this, data);
      };
    } catch (err) {
      console.error("❌ XP middleware error:", err.message);
    }
  }
  next();
};

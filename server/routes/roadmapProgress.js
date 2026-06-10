import express from "express";
import { protect } from "../middleware/auth.js";
import RoadmapProgress from "../models/RoadmapProgress.js";

const router = express.Router();

// Get user progress
router.get("/progress", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const progress = await RoadmapProgress.find({ userId });
    res.status(200).json({ success: true, progress });
  } catch (err) {
    next(err);
  }
});

// Save or update user progress
router.post("/progress", protect, async (req, res, next) => {
  try {
    const { roadmap, phase, completedTopics, totalTopicsCount } = req.body;

    if (!roadmap || phase === undefined || !Array.isArray(completedTopics) || totalTopicsCount === undefined) {
      return res.status(400).json({ success: false, message: "Missing required fields: roadmap, phase, completedTopics, totalTopicsCount" });
    }

    const userId = req.user._id;

    // Find existing progress
    let progress = await RoadmapProgress.findOne({ userId, roadmap, phase });

    let wasCompletedBefore = false;
    if (progress) {
      wasCompletedBefore = progress.completedTopics.length >= totalTopicsCount;
    }

    if (!progress) {
      progress = new RoadmapProgress({
        userId,
        roadmap,
        phase,
        completedTopics,
      });
    } else {
      progress.completedTopics = completedTopics;
    }

    await progress.save();

    const isCompletedNow = completedTopics.length >= totalTopicsCount;
    let xpAwarded = 0;

    if (isCompletedNow && !wasCompletedBefore) {
      xpAwarded = 10;
      req.user.xp = (req.user.xp || 0) + xpAwarded;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      progress,
      xpAwarded,
      totalXp: req.user.xp,
      triggerConfetti: isCompletedNow && !wasCompletedBefore,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

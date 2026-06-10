import mongoose from "mongoose";

const RoadmapProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roadmap: {
      type: String,
      required: true,
    },
    phase: {
      type: Number,
      required: true,
    },
    completedTopics: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Unique index: a user can only have one progress entry per roadmap per phase
RoadmapProgressSchema.index({ userId: 1, roadmap: 1, phase: 1 }, { unique: true });

const RoadmapProgress = mongoose.model("RoadmapProgress", RoadmapProgressSchema);
export default RoadmapProgress;

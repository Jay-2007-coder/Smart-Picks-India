import mongoose from "mongoose";

const PlacementApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
    },
    packageLPA: {
      type: Number,
      default: 0,
      min: [0, "Package cannot be negative"],
    },
    stage: {
      type: String,
      enum: ["applied", "oa", "tech", "hr", "offered", "rejected"],
      default: "applied",
      lowercase: true,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Ensure index on userId and stage for performance queries
PlacementApplicationSchema.index({ userId: 1, stage: 1 });

const PlacementApplication = mongoose.models.PlacementApplication || mongoose.model("PlacementApplication", PlacementApplicationSchema);
export default PlacementApplication;

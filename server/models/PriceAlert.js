import mongoose from "mongoose";

const PriceAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      required: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ["email", "telegram"],
      default: "email",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for cron job price checking performance
PriceAlertSchema.index({ slug: 1, isActive: 1 });

const PriceAlert = mongoose.model("PriceAlert", PriceAlertSchema);
export default PriceAlert;

import mongoose from "mongoose";

const PriceHistorySchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate price records on the same day for a product
PriceHistorySchema.index({ slug: 1, date: 1 });

const PriceHistory = mongoose.model("PriceHistory", PriceHistorySchema);
export default PriceHistory;

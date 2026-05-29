import mongoose from "mongoose";

const DealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    oldPrice: {
      type: Number,
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    score: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  { timestamps: true }
);

// Method to calculate Reddit-like Hot score
DealSchema.methods.calculateScore = function () {
  const upCount = this.upvotes.length;
  const downCount = this.downvotes.length;
  const rawScore = upCount - downCount;

  // Simple decay: score = rawScore / (ageInHours + 2)^1.5
  const ageInHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
  this.score = rawScore / Math.pow(ageInHours + 2, 1.5);
  return this.score;
};

const Deal = mongoose.model("Deal", DealSchema);
export default Deal;

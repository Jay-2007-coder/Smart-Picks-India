import mongoose from "mongoose";
import { Schema } from "mongoose";

const FavoriteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "DigitalProduct",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index to ensure uniqueness of bookmarks per user
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Favorite = mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);
export default Favorite;

import mongoose from "mongoose";
import { Schema } from "mongoose";

const PurchaseSchema = new Schema(
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
    paymentId: {
      type: String,
      trim: true,
    },
    orderId: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    secureToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
export default Purchase;

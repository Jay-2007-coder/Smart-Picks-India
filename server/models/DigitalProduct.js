import mongoose from "mongoose";
import { Schema } from "mongoose";

const DigitalProductSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    type: {
      type: String,
      enum: ["free", "paid", "freemium"],
      default: "free",
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    filePath: {
      type: String,
      required: function () {
        return this.type !== "free" || this.price > 0;
      },
      trim: true,
    },
    previewPath: {
      type: String,
      trim: true,
    },
    downloadLimit: {
      type: Number,
      default: 0, // 0 means unlimited
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        userName: String,
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Binary attachments for persistence on ephemeral hosting platforms (like Render Free Tier)
    coverImageBuffer: {
      type: Buffer,
    },
    coverImageMimeType: {
      type: String,
    },
    fileBuffer: {
      type: Buffer,
    },
    fileMimeType: {
      type: String,
    },
    fileOriginalName: {
      type: String,
    },
    previewBuffer: {
      type: Buffer,
    },
    previewMimeType: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate average rating
DigitalProductSchema.pre("save", function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
  } else {
    this.averageRating = 0;
  }
  next();
});

const DigitalProduct = mongoose.models.DigitalProduct || mongoose.model("DigitalProduct", DigitalProductSchema);
export default DigitalProduct;

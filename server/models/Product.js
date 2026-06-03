import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    asin: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    affiliateLink: {
      type: String,
      required: true,
      trim: true,
    },
    trending: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    features: {
      type: [String],
      default: [],
    },
    pros: {
      type: [String],
      default: [],
    },
    cons: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    dealOfTheDay: {
      type: Boolean,
      default: false,
    },
    flashDeal: {
      type: Boolean,
      default: false,
    },
    flashDealEndsAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
export default Product;

import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      trim: true,
      default: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1000&q=80",
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    datePublished: {
      type: String,
      required: true,
    },
    dateModified: {
      type: String,
      required: true,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    featured: {
      type: Boolean,
      default: true,
    },
    faqs: [
      {
        question: { type: String, trim: true, default: "" },
        answer: { type: String, trim: true, default: "" },
      },
    ],
    toc: [
      {
        id: { type: String, trim: true, default: "" },
        title: { type: String, trim: true, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
export default Blog;

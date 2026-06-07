import express from "express";
import Blog from "../models/Blog.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Helper to convert title to URL slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET ALL DATABASE BLOG POSTS
// ──────────────────────────────────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      blogs,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC: GET SINGLE DATABASE BLOG BY SLUG
// ──────────────────────────────────────────────────────────────────────────────
router.get("/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.findOne({ slug });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: `Blog post with slug '${slug}' not found.`,
      });
    }
    res.status(200).json({
      success: true,
      blog,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// SECURE ADMIN: CREATE NEW BLOG POST
// ──────────────────────────────────────────────────────────────────────────────
router.post("/", protect, requireAdmin, async (req, res, next) => {
  try {
    const {
      title,
      excerpt,
      content,
      image,
      category,
      tags,
      readTime,
      featured,
      faqs,
      toc,
    } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and category are required.",
      });
    }

    // Auto-generate unique slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let slugCounter = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Auto-generate Table of Contents from markdown headings starting with '## ' if not provided
    let computedToc = toc;
    if ((!computedToc || computedToc.length === 0) && content) {
      const lines = content.split("\n");
      const list = [];
      lines.forEach((line) => {
        if (line.startsWith("## ")) {
          const titleText = line.replace("## ", "").trim();
          const id = titleText
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
          list.push({ id, title: titleText });
        }
      });
      computedToc = list;
    }

    const cleanFaqs = (faqs || []).filter(
      (f) => f.question?.trim() && f.answer?.trim()
    );
    const tagsArray = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const dateStr = new Date().toISOString().split("T")[0];

    const newBlog = new Blog({
      slug,
      title,
      excerpt: excerpt || "",
      content,
      image: image || "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1000&q=80",
      category: category.toLowerCase().trim(),
      tags: tagsArray,
      datePublished: dateStr,
      dateModified: dateStr,
      readTime: readTime || "5 min read",
      featured: featured !== undefined ? featured : true,
      faqs: cleanFaqs,
      toc: computedToc || [],
    });

    await newBlog.save();

    res.status(201).json({
      success: true,
      message: "Blog post published successfully!",
      blog: newBlog,
    });
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// SECURE ADMIN: DELETE BLOG POST
// ──────────────────────────────────────────────────────────────────────────────
router.delete("/:id", protect, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;

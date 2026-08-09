import Blog from "../models/Blog.js";
import Product from "../models/Product.js";
import { generateAiBlogContent } from "../utils/aiBlogGenerator.js";

/**
 * generateDailyAiBlog
 * Checks if a blog was posted today. If not, generates and saves a new AI blog post.
 */
export async function generateDailyAiBlog(overrideTopic = null) {
  const todayStr = new Date().toISOString().split("T")[0];

  // If not overridden, check if today's blog already exists
  if (!overrideTopic) {
    const existingBlog = await Blog.findOne({ datePublished: todayStr });
    if (existingBlog) {
      console.log(`ℹ️ Daily AI Blog already published for today (${todayStr}): "${existingBlog.title}"`);
      return existingBlog;
    }
  }

  console.log(`🤖 Auto-generating Daily AI Blog Post (Topic: ${overrideTopic || "auto"})...`);

  // Fetch sample products from MongoDB catalog for deals context
  let products = [];
  try {
    products = await Product.find({}).limit(10).lean();
  } catch (err) {
    console.warn("⚠️ Could not fetch catalog products for blog context:", err.message);
  }

  const blogData = await generateAiBlogContent(overrideTopic || "auto", products);

  // Ensure unique slug
  let baseSlug = blogData.slug;
  let slug = baseSlug;
  let counter = 1;
  while (await Blog.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newBlog = new Blog({
    slug,
    title: blogData.title,
    excerpt: blogData.excerpt,
    content: blogData.content,
    image: blogData.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
    category: (blogData.category || "buying-guides").toLowerCase().trim(),
    tags: blogData.tags || ["AI", "Smart Picks"],
    datePublished: todayStr,
    dateModified: todayStr,
    readTime: blogData.readTime || "5 min read",
    featured: true,
    faqs: blogData.faqs || [],
    toc: blogData.toc || [],
  });

  await newBlog.save();
  console.log(`✅ Daily AI Blog published successfully: "${newBlog.title}" [slug: ${newBlog.slug}]`);

  return newBlog;
}

/**
 * initBlogPosterCron
 * Starts daily automated blog poster daemon
 */
export function initBlogPosterCron() {
  console.log("⏰ Initializing Daily AI Blog Poster daemon...");

  // Run check 15 seconds after startup to ensure DB connection is stable
  setTimeout(() => {
    generateDailyAiBlog().catch((err) => {
      console.error("❌ Daily AI Blog startup generation error:", err.message);
    });
  }, 15000);

  // Schedule every 24 hours (86,400,000 ms)
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    generateDailyAiBlog().catch((err) => {
      console.error("❌ Scheduled Daily AI Blog generation error:", err.message);
    });
  }, TWENTY_FOUR_HOURS);
}

import { blogPosts as staticPosts, type BlogPost } from "@/data/blogPosts";
import fs from "fs";
import path from "path";

const DYNAMIC_BLOGS_FILE = path.join(process.cwd(), "data", "generatedBlogs.json");

/** Convert content stored as object array (Gemini JSON) to a markdown string */
function contentToMarkdown(content: any): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((block: any) => {
      if (!block || !block.type) return "";
      const d = block.data;
      switch (block.type) {
        case "heading": {
          const level = d?.level ?? 2;
          const text = d?.text ?? d ?? "";
          const id = d?.id ? ` {#${d.id}}` : "";
          return `${"#".repeat(level)} ${text}`;
        }
        case "paragraph":
          return typeof d === "string" ? d : "";
        case "list": {
          const items: string[] = Array.isArray(d?.items) ? d.items : [];
          return items.map((it: string) => `- ${it}`).join("\n");
        }
        case "quote":
          return `> ${d}`;
        case "code":
          return `\`\`\`\n${d}\n\`\`\``;
        default:
          return typeof d === "string" ? d : "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

/** Normalize a raw blog post (handles both string and array content) */
function normalizePost(raw: any): BlogPost {
  return {
    ...raw,
    content: contentToMarkdown(raw.content),
  };
}

// Helper to load dynamic blogs saved locally
export function getLocalGeneratedBlogs(): BlogPost[] {
  try {
    if (fs.existsSync(DYNAMIC_BLOGS_FILE)) {
      // Strip BOM if present (PowerShell Set-Content adds UTF-8 BOM)
      const fileData = fs.readFileSync(DYNAMIC_BLOGS_FILE, "utf-8").replace(/^\uFEFF/, "");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) return parsed.map(normalizePost);
    }
  } catch (err) {
    console.warn("Could not read local generated blogs file:", err);
  }
  return [];
}

// Helper to save dynamic blogs locally
export function saveLocalGeneratedBlog(rawBlog: any): void {
  try {
    // Strip MongoDB-specific fields and normalize content
    const blog: BlogPost = normalizePost({
      slug: rawBlog.slug,
      title: rawBlog.title,
      excerpt: rawBlog.excerpt || "",
      content: rawBlog.content || "",
      image: rawBlog.image || "",
      category: (rawBlog.category || "buying-guides").toLowerCase().trim(),
      tags: Array.isArray(rawBlog.tags) ? rawBlog.tags : [],
      datePublished: rawBlog.datePublished || new Date().toISOString().split("T")[0],
      dateModified: rawBlog.dateModified || new Date().toISOString().split("T")[0],
      readTime: rawBlog.readTime || "5 min read",
      featured: rawBlog.featured !== undefined ? rawBlog.featured : true,
      faqs: Array.isArray(rawBlog.faqs) ? rawBlog.faqs : [],
      toc: Array.isArray(rawBlog.toc) ? rawBlog.toc : [],
    });

    const existing = getLocalGeneratedBlogs();
    const filtered = existing.filter((b) => b.slug !== blog.slug);
    filtered.unshift(blog);
    
    const dir = path.dirname(DYNAMIC_BLOGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DYNAMIC_BLOGS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    console.log(`✅ Blog saved locally: "${blog.title}" (${blog.slug})`);
  } catch (err) {
    console.warn("Could not save local generated blog:", err);
  }
}

// Helper to fetch all combined blogs (MongoDB + Local JSON + Static TypeScript catalog)
export async function getAllBlogs(): Promise<BlogPost[]> {
  let backendBlogs: BlogPost[] = [];
  try {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    const res = await fetch(`${backendUrl}/api/v1/blog`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.blogs)) {
        backendBlogs = data.blogs;
      }
    }
  } catch (err) {
    // Express backend not running locally — ignore
  }

  const localBlogs = getLocalGeneratedBlogs();

  // Deduplicate by slug (MongoDB > Local Generated > Static)
  const slugMap = new Map<string, BlogPost>();

  // Add static posts first
  staticPosts.forEach((post) => slugMap.set(post.slug, post));

  // Layer local generated posts on top
  localBlogs.forEach((post) => slugMap.set(post.slug, post));

  // Layer backend MongoDB posts on top
  backendBlogs.forEach((post) => slugMap.set(post.slug, post));

  // Sort by datePublished descending
  return Array.from(slugMap.values()).sort((a, b) => {
    const dateA = new Date(a.datePublished).getTime() || 0;
    const dateB = new Date(b.datePublished).getTime() || 0;
    return dateB - dateA;
  });
}

// Helper to fetch single blog by slug
export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const all = await getAllBlogs();
  return all.find((p) => p.slug === slug) || null;
}

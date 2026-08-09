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
      const fileData = fs.readFileSync(DYNAMIC_BLOGS_FILE, "utf-8");
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed)) return parsed.map(normalizePost);
    }
  } catch (err) {
    console.warn("Could not read local generated blogs file:", err);
  }
  return [];
}

// Helper to save dynamic blogs locally
export function saveLocalGeneratedBlog(blog: BlogPost): void {
  try {
    const existing = getLocalGeneratedBlogs();
    const filtered = existing.filter((b) => b.slug !== blog.slug);
    filtered.unshift(blog);
    
    const dir = path.dirname(DYNAMIC_BLOGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DYNAMIC_BLOGS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
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
      next: { revalidate: 10 },
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

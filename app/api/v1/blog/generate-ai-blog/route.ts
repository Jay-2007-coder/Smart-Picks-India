import { NextResponse } from "next/server";
import { products } from "@/data/products";
import { blogPosts } from "@/data/blogPosts";

export const runtime = "nodejs";

function slugify(text: string) {
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

async function callGeminiDirect(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.0-pro"];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn(`Direct Gemini ${model} call failed:`, err);
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const topicType = body.topic || "auto";

    // 1. Try Express backend first if available
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:5000";
    try {
      const backendRes = await fetch(`${backendUrl}/api/v1/blog/generate-ai-blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicType }),
      });
      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData.success) {
          return NextResponse.json(backendData, { status: 200 });
        }
      }
    } catch (err) {
      // Backend not running locally or unreachable — proceed to local Next.js AI generation fallback
      console.log("ℹ️ Express backend unreachable, generating AI blog via Next.js handler...");
    }

    // 2. Local Next.js AI Generation
    const todayStr = new Date().toISOString().split("T")[0];
    const currentDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const TOPICS = ["deals", "student-hub", "tech-trends"];
    let selectedTopic = topicType;
    if (selectedTopic === "auto") {
      const day = new Date().getDate();
      selectedTopic = TOPICS[day % TOPICS.length];
    }

    const slimCatalog = products.slice(0, 5).map((p) => ({
      title: p.title,
      category: p.category,
      price: p.price,
      oldPrice: p.oldPrice,
      rating: p.rating,
      slug: p.slug,
    }));

    const systemPrompt = `You are Head Editor for Smart Picks India (https://smart-picks-india.vercel.app).
Generate a high-quality blog post in valid JSON format.
Return ONLY raw JSON with keys: title, excerpt, category, tags, image, readTime, content, faqs, toc.`;

    const userPrompt = `Topic: "${selectedTopic}". Date: "${currentDate}". Catalog: ${JSON.stringify(slimCatalog)}`;

    let blogObj: any = null;
    const rawAi = await callGeminiDirect(systemPrompt, userPrompt);
    if (rawAi) {
      try {
        blogObj = JSON.parse(rawAi.replace(/```json|```/g, "").trim());
      } catch (e) {
        console.warn("JSON parse error on raw AI:", e);
      }
    }

    if (!blogObj || !blogObj.title) {
      // Curated Fallback
      if (selectedTopic === "deals") {
        blogObj = {
          title: `Top Budget Deals & Smart Buying Guide (${currentDate})`,
          excerpt: `Handpicked deals on electronics, home items, and lifestyle gear verified by Smart Picks India.`,
          category: "buying-guides",
          tags: ["Deals", "Buying Guide", "Budget Picks"],
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
          readTime: "5 min read",
          content: `# Top Budget Deals & Smart Buying Guide\n\nFinding authentic discounts requires tracking price history...`,
          faqs: [{ question: "Are prices updated daily?", answer: "Yes, our automated tracking monitors Amazon price drops daily." }],
        };
      } else if (selectedTopic === "student-hub") {
        blogObj = {
          title: `Placement Preparation & ATS Resume Blueprint for College Students (${currentDate})`,
          excerpt: `Master your campus placements with single-page ATS resumes, CGPA targets, and AI interview practice.`,
          category: "student-hub",
          tags: ["Placements", "Resume Builder", "Student Hub"],
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
          readTime: "6 min read",
          content: `# Placement Preparation & ATS Resume Blueprint\n\nCampus placement season demands a structured strategy...`,
          faqs: [{ question: "Is Student Hub free?", answer: "Yes, all student tools are 100% free to access." }],
        };
      } else {
        blogObj = {
          title: `Top AI Developer Tools & Tech Frameworks in 2026`,
          excerpt: `An expert breakdown of autonomous AI coding assistants and modern web architectures.`,
          category: "tech-trends",
          tags: ["AI", "Web Development", "Tech Trends"],
          image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
          readTime: "6 min read",
          content: `# Top AI Developer Tools & Tech Frameworks in 2026\n\nThe software landscape is evolving rapidly...`,
          faqs: [{ question: "Which AI models are best?", answer: "Cascaded Gemini AI models offer state-of-the-art reasoning." }],
        };
      }
    }

    const title = blogObj.title;
    const slug = slugify(title);

    const newBlog = {
      slug,
      title,
      excerpt: blogObj.excerpt || "",
      content: blogObj.content || "",
      image: blogObj.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80",
      category: (blogObj.category || "buying-guides").toLowerCase().trim(),
      tags: blogObj.tags || ["AI", "Smart Picks"],
      datePublished: todayStr,
      dateModified: todayStr,
      readTime: blogObj.readTime || "5 min read",
      featured: true,
      faqs: blogObj.faqs || [],
      toc: blogObj.toc || [],
    };

    // Add to local in-memory posts array if not already present
    if (!blogPosts.some((b) => b.slug === slug)) {
      blogPosts.unshift(newBlog);
    }

    return NextResponse.json({
      success: true,
      message: `AI Blog post ("${newBlog.title}") generated & published successfully!`,
      blog: newBlog,
    });
  } catch (err: any) {
    console.error("Next.js AI blog route error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate AI blog post." },
      { status: 500 }
    );
  }
}

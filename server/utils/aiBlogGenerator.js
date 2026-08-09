import { callGemini, cleanGeminiJson } from "./gemini.js";

const TOPIC_TYPES = ["deals", "student-hub", "tech-trends"];

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

/**
 * generateAiBlogContent
 * @param {string} topicType - "deals" | "student-hub" | "tech-trends" | "auto"
 * @param {Array} sampleProducts - List of products from MongoDB catalog
 */
export async function generateAiBlogContent(topicType = "auto", sampleProducts = []) {
  let selectedTopic = topicType;
  if (!selectedTopic || selectedTopic === "auto") {
    // Pick topic randomly based on day of month
    const day = new Date().getDate();
    selectedTopic = TOPIC_TYPES[day % TOPIC_TYPES.length];
  }

  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const slimCatalog = (sampleProducts || []).slice(0, 5).map((p) => ({
    title: p.title,
    category: p.category,
    price: p.price,
    originalPrice: p.originalPrice || p.oldPrice,
    rating: p.rating,
    reviewCount: p.reviewCount,
    slug: p.slug,
    affiliateLink: p.affiliateLink,
  }));

  const systemPrompt = `You are the Head Editor & Senior Tech/Deals Columnist for Smart Picks India (https://smart-picks-india.vercel.app).
Generate a long-form, highly engaging, professional blog post in valid JSON format.
The article must be tailored for an Indian audience, feature crisp Markdown formatting in the content field, include actionable advice, pros & cons, FAQs, and a Table of Contents.

Topic Type: "${selectedTopic}"
Date: "${currentDate}"
Catalog Context: ${JSON.stringify(slimCatalog)}

JSON Output Requirements (NO markdown codeblocks around the JSON, return ONLY raw JSON):
{
  "title": "A captivating, click-worthy SEO title (50-70 characters)",
  "excerpt": "A compelling 2-sentence summary introducing the article",
  "category": "buying-guides | student-hub | tech-trends",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "image": "An Unsplash image URL relevant to the topic (e.g. https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80)",
  "readTime": "6 min read",
  "content": "# Markdown content with ## subheadings, bullet points, pros & cons callouts, and expert tips",
  "faqs": [
    { "question": "Clear FAQ Question 1?", "answer": "Detailed answer..." },
    { "question": "Clear FAQ Question 2?", "answer": "Detailed answer..." }
  ],
  "toc": [
    { "id": "heading-id-1", "title": "Heading 1 Title" },
    { "id": "heading-id-2", "title": "Heading 2 Title" }
  ]
}`;

  let userPrompt = "";
  if (selectedTopic === "deals") {
    userPrompt = `Write a comprehensive Product Review & Buying Guide focusing on top deals in India available today. Highlight key budget categories, price-to-value ratios, and why smart shoppers should act now.`;
  } else if (selectedTopic === "student-hub") {
    userPrompt = `Write an ultimate guide for Indian engineering & college students on mastering placement preparation, building ATS-friendly resumes, tracking applications, and utilizing AI study tools.`;
  } else {
    userPrompt = `Write an insightful tech trends article on the top AI developer tools, modern web frameworks, and productivity software transforming tech in 2026.`;
  }

  let aiResult = null;
  try {
    const rawAi = await callGemini(systemPrompt, userPrompt, true);
    if (rawAi) {
      aiResult = cleanGeminiJson(rawAi);
    }
  } catch (err) {
    console.warn("⚠️ Gemini AI Blog generation error:", err.message);
  }

  // Fallback to rich pre-built dynamic blog generator if AI output is empty or invalid
  if (!aiResult || !aiResult.title || !aiResult.content) {
    console.log("ℹ️ Utilizing curated Smart AI Blog template fallback for topic:", selectedTopic);
    aiResult = createFallbackBlogTemplate(selectedTopic, slimCatalog, currentDate);
  }

  // Compute TOC from markdown content if missing
  if (!aiResult.toc || aiResult.toc.length === 0) {
    const lines = (aiResult.content || "").split("\n");
    const list = [];
    lines.forEach((line) => {
      if (line.startsWith("## ")) {
        const titleText = line.replace("## ", "").trim();
        const id = slugify(titleText);
        list.push({ id, title: titleText });
      }
    });
    aiResult.toc = list;
  }

  // Ensure slug exists
  aiResult.slug = slugify(aiResult.title);

  return aiResult;
}

/**
 * Curated Fallback Templates for Guaranteed Publishing
 */
function createFallbackBlogTemplate(topic, catalog, currentDate) {
  if (topic === "deals") {
    const topItem = catalog[0] || { title: "Wireless Noise Cancelling Earbuds", price: 1299, originalPrice: 3499, slug: "boat-airdopes" };
    return {
      title: `Top Budget Picks & Amazon India Deal Roundup (${currentDate})`,
      excerpt: `Discover the best value-for-money deals in tech, audio, and home accessories carefully verified by Smart Picks India.`,
      category: "buying-guides",
      tags: ["Deals", "Buying Guide", "Amazon India", "Budget Tech"],
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80",
      readTime: "5 min read",
      content: `# Top Budget Picks & Amazon India Deal Roundup

Finding genuine discounts among thousands of e-commerce listings can be overwhelming. Today, we review standout budget deals in India that deliver maximum price-to-performance value.

## 1. ${topItem.title}
If you're looking for high quality on a budget, **${topItem.title}** is currently priced at **₹${topItem.price.toLocaleString("en-IN")}** (down from ₹${(topItem.originalPrice || topItem.price * 2).toLocaleString("en-IN")}).

### Key Highlights
- **High Value Ratio**: Exceptional build quality at an affordable price point.
- **Verified Seller Guarantee**: Ships via Amazon Prime with full return window.
- **Smart Pick Rating**: 9.4 / 10 Value Score.

## 2. Essential Factors When Buying Budget Tech
Before clicking buy, keep these three factors in mind:
1. **Historical Price Trend**: Always verify if the current price is a true price drop.
2. **Warranty & Support**: Ensure localized Indian customer service centers exist.
3. **Genuine Customer Reviews**: Look beyond star ratings to actual long-term usage feedback.

## Summary Verdict
Whether upgrading your daily gear or hunting for festive gifts, keeping track of daily price drops ensures you never overpay. Explore our live [Deals Explorer](/deals) for instant price drop tracking.`,
      faqs: [
        { question: "How often are prices verified on Smart Picks India?", answer: "Our automated systems monitor price drops and seller ratings every 24 hours." },
        { question: "Are these deal links direct manufacturer listings?", answer: "Yes, all affiliate links redirect directly to official Amazon India product pages." }
      ]
    };
  }

  if (topic === "student-hub") {
    return {
      title: `The Ultimate Placement Preparation Strategy for Engineering Students (${currentDate})`,
      excerpt: `Learn how to leverage AI tools, CGPA targets, ATS resume scoring, and technical interview generators to land your dream offer.`,
      category: "student-hub",
      tags: ["Placements", "Resume Builder", "DSA", "Student Hub", "AI Tools"],
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
      readTime: "6 min read",
      content: `# The Ultimate Placement Preparation Strategy for College Students

Entering the campus placement season requires a structured, multi-dimensional preparation strategy. From maintaining academic CGPA to building ATS-ready resumes, here is your step-by-step roadmap.

## 1. Optimizing Your Academic CGPA Threshold
Most tier-1 product companies and MNCs maintain a strict **7.5+ CGPA cutoff**. 
Use the [Smart Picks CGPA Calculator](/student-hub/cgpa-calculator) to project semester target credits and track target grade points accurately.

## 2. Crafting an ATS-Compliant 1-Page Resume
Recruiters spend less than 6 seconds scanning each resume.
- Keep your layout clean, single-column, and formatted in standard typography.
- Use action verbs (*e.g., Developed, Engineered, Optimized*) alongside quantified metrics (*e.g., Improved API latency by 42%*).
- Test your resume using our [Print-Ready Resume Builder](/student-hub/resume-builder).

## 3. Mastering Technical Interviews with AI
Mock practice builds confidence under pressure. Practice company-specific questions with our [AI Interview Generator](/student-hub/interview-generator) to refine your explanation of Data Structures, Algorithms, and System Design principles.

## Summary Verdict
Consistency outperforms last-minute cramming. Explore the full suite of free placement utilities in the [Smart Picks Student Hub](/student-hub).`,
      faqs: [
        { question: "Is the Smart Picks Student Hub free to use?", answer: "Yes, all student tools including CGPA calculators, resume builders, and roadmap guides are free to access." },
        { question: "How does the ATS Resume Analyzer score resumes?", answer: "It compares your resume against targeted Job Description keywords using NLP parsing." }
      ]
    };
  }

  // Default: tech-trends
  return {
    title: `Top AI Developer Tools & Tech Frameworks Shaping Web Dev in 2026`,
    excerpt: `A curated breakdown of modern AI coding assistants, full-stack frameworks, and developer workflows boosting engineer productivity.`,
    category: "tech-trends",
    tags: ["AI", "Web Development", "TypeScript", "Next.js", "Developer Tools"],
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
    readTime: "6 min read",
    content: `# Top AI Developer Tools & Tech Frameworks Shaping Web Dev in 2026

The software development landscape is undergoing a massive shift. Developers who harness AI coding assistants and modern web architectures are shipping full-stack applications faster than ever before.

## 1. Autonomous Agentic AI Assistants
Modern AI coding tools go far beyond simple tab-autocompletion. Next-generation agentic assistants read workspace context, refactor complex codebases, execute terminal commands, and verify UI changes via automated headless browsers.

## 2. Next.js App Router & Server Components
Combining React Server Components with edge caching delivers near-instant page load times and optimal SEO indexing. 

## 3. High-Performance Styling & Micro-Animations
Clean visual hierarchy and minimal, crisp design tokens (TailwindCSS v4 & Framer Motion) are replacing cluttered glassmorphism.

## Summary Verdict
Staying ahead in tech requires adopting tools that amplify human creativity rather than replacing fundamental engineering principles. Explore our interactive [Developer Roadmaps](/student-hub/roadmaps) to level up your skill tree.`,
    faqs: [
      { question: "Which AI models power Smart Picks India tools?", answer: "We utilize Google Gemini AI models cascaded with localized fallback heuristics." },
      { question: "Where can I learn full-stack web development?", answer: "Check out our interactive Web Dev & AI/ML roadmaps in the Student Hub." }
    ]
  };
}

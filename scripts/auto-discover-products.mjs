/**
 * SmartPicks India — Fully Automated Product Discovery
 * ------------------------------------------------------
 * Uses Gemini AI with Google Search grounding to automatically find
 * the top trending/best-deal products on Amazon India every day.
 * Generates full review content and adds them to data/products.ts.
 *
 * ZERO manual work required — runs daily via GitHub Actions.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname        = path.dirname(fileURLToPath(import.meta.url));
const GEMINI_KEY       = process.env.GEMINI_API_KEY;
const AMAZON_TAG       = process.env.AMAZON_TAG || "smartpick07d2-21";
const PRODUCTS_PER_RUN = parseInt(process.env.PRODUCTS_PER_RUN || "5");
const PRODUCTS_FILE    = path.join(process.cwd(), "data", "products.ts");

if (!GEMINI_KEY) {
  console.error("❌ Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ─── STEP 1: Discover top products (two-phase: search then extract) ───────────
async function discoverTopProducts() {
  console.log("🔍 Searching for top Amazon India deals today using Gemini + Google Search...\n");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  // Phase A: Gemini + Google Search → returns natural language (not JSON)
  const searchModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} }],
  });

  const searchResult = await searchModel.generateContent(
    `Today is ${today}. Search Amazon India (amazon.in) and find ${PRODUCTS_PER_RUN} real trending or best-selling products right now. For each product find: exact product name, direct Amazon.in URL with ASIN code, current price in INR, original MRP in INR, product image URL from m.media-amazon.com, and best category (tech/gadgets/home/kitchen/fashion/study). Focus on products with good discounts.`
  );
  const searchText = searchResult.response.text();
  console.log("   ✅ Search complete. Extracting structured data...");

  // Phase B: Plain Gemini → parse the search text into clean JSON
  const extractModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const extractResult = await extractModel.generateContent(
    `Extract product details from the text below and return ONLY a raw JSON array. No markdown, no backticks, no explanation — just the JSON array starting with [ and ending with ].

Rules:
- "asin" must be a 10-character Amazon ASIN code (starts with B0 typically)
- "price" and "oldPrice" are plain numbers (no rupee symbol, no commas)
- "oldPrice" must be greater than "price" — if unknown, use Math.round(price * 1.5)
- "category" must be exactly one of: tech, gadgets, home, kitchen, fashion, study
- "imageUrl" from m.media-amazon.com if found, else use empty string ""
- Return up to ${PRODUCTS_PER_RUN} products

Text to extract from:
---
${searchText}
---

Return ONLY this JSON format (nothing else before or after):
[{"name":"Product name","asin":"B0XXXXXXXXX","category":"tech","price":1299,"oldPrice":2999,"imageUrl":""}]`
  );

  let raw = extractResult.response.text().trim();
  // Strip any markdown fences
  raw = raw.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/\s*```$/m, "");
  // Find the JSON array
  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    console.error("Extraction response preview:", raw.substring(0, 500));
    throw new Error("Could not extract a JSON array from Gemini response.");
  }

  const products = JSON.parse(arrayMatch[0]);
  const valid = products.filter(p => p.name && p.asin && p.price > 0);
  console.log(`   ✅ Extracted ${valid.length} valid product(s).\n`);
  return valid;
}

// ─── STEP 2: Generate full SEO review content ─────────────────────────────────
async function generateReviewContent(product) {
  const reviewModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const prompt = `Write an expert SEO-optimized affiliate product review for the Indian market.

Product: "${product.name}"
Category: ${product.category}
Price: ₹${product.price}${hasDiscount ? ` (${discountPct}% off from MRP ₹${product.oldPrice})` : ""}

Return ONLY a raw JSON object (no backticks, no markdown):
{
  "slug": "url-friendly-slug-max-60-chars",
  "title": "catchy SEO title with product name and review keyword (max 80 chars)",
  "description": "2-3 sentences with key benefits and India context",
  "rating": 4.4,
  "reviewCount": 1500,
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

  const result = await reviewModel.generateContent(prompt);
  let raw = result.response.text().trim();
  raw = raw.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/\s*```$/m, "");

  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error("Invalid JSON from Gemini review generator");
  return JSON.parse(objMatch[0]);
}

// ─── STEP 3: Duplicate check ──────────────────────────────────────────────────
function loadExistingContent() {
  return fs.readFileSync(PRODUCTS_FILE, "utf8");
}

function isAlreadyAdded(existingContent, asin, productName) {
  if (asin && existingContent.includes(asin)) return true;
  const nameSlug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .slice(0, 4)
    .join("-");
  return existingContent.includes(nameSlug);
}

// ─── STEP 4: Build TypeScript product entry ───────────────────────────────────
function buildProductEntry(discovered, review) {
  const affiliateLink = `https://www.amazon.in/dp/${discovered.asin}?tag=${AMAZON_TAG}`;
  const safe = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const fallbackImg = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80";

  return `{
    slug: "${safe(review.slug)}",
    title: "${safe(review.title)}",
    image: "${safe(discovered.imageUrl || fallbackImg)}",
    category: "${safe(discovered.category.toLowerCase())}",
    description: "${safe(review.description)}",
    price: ${discovered.price},
    oldPrice: ${discovered.oldPrice || discovered.price},
    rating: ${review.rating || 4.3},
    reviewCount: ${review.reviewCount || 1200},
    affiliateLink: "${affiliateLink}",
    features: ${JSON.stringify(review.features || [])},
    pros: ${JSON.stringify(review.pros || [])},
    cons: ${JSON.stringify(review.cons || [])},
    featured: false,
    trending: true,
    dealOfTheDay: ${discovered.oldPrice > discovered.price * 1.3},
    tags: ${JSON.stringify(review.tags || [])},
  }`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log("🚀 SmartPicks Auto-Discovery — Starting...");
  console.log(`📅 Date: ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}\n`);

  const discovered = await discoverTopProducts();
  let existingContent = loadExistingContent();
  let addedCount = 0;

  for (const product of discovered) {
    const asin = product.asin?.trim();
    const name = product.name?.trim();

    if (!asin || !name || !product.price) {
      console.log(`⚠️  Skipping incomplete entry: ${name || "unknown"}`);
      continue;
    }

    if (isAlreadyAdded(existingContent, asin, name)) {
      console.log(`⏭️  Already exists — Skipping: ${name}`);
      continue;
    }

    console.log(`\n📦 Processing: ${name}`);
    console.log(`   ASIN: ${asin} | Category: ${product.category} | Price: ₹${product.price}`);

    try {
      console.log("   🤖 Generating SEO review content...");
      const reviewData = await generateReviewContent(product);
      console.log(`   📝 Slug: ${reviewData.slug}`);

      const newEntry = buildProductEntry(product, reviewData);

      existingContent = existingContent.replace(
        /\]\s*;\s*$/,
        `,\n  ${newEntry}\n];\n`
      );

      addedCount++;
      console.log(`   ✅ Added: ${name}`);

      await new Promise((r) => setTimeout(r, 1500));
    } catch (err) {
      console.error(`   ❌ Failed for "${name}":`, err.message);
    }
  }

  if (addedCount > 0) {
    fs.writeFileSync(PRODUCTS_FILE, existingContent, "utf8");
    console.log(`\n🎉 Done! Added ${addedCount} new product(s) to data/products.ts`);
    console.log("   Vercel will auto-redeploy with the new listings.");
  } else {
    console.log("\n✨ No new products to add today — all already exist.");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

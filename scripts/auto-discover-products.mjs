/**
 * SmartPicks India — Fully Automated Product Discovery
 * ------------------------------------------------------
 * Uses Gemini AI with Google Search grounding to automatically find
 * the top trending/best-deal products on Amazon India every day.
 * Generates full review content and adds them to data/products.ts.
 *
 * ZERO manual work required — runs daily via GitHub Actions.
 *
 * Flow:
 *  1. Gemini searches the web for top Amazon India deals today
 *  2. Extracts product details (name, ASIN, price, category, image)
 *  3. Skips products already in products.ts (duplicate check)
 *  4. Generates SEO review content with Gemini
 *  5. Appends new products to data/products.ts
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const GEMINI_KEY  = process.env.GEMINI_API_KEY;
const AMAZON_TAG  = process.env.AMAZON_TAG || "smartpick07d2-21";
const PRODUCTS_PER_RUN = parseInt(process.env.PRODUCTS_PER_RUN || "5");
const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.ts");

if (!GEMINI_KEY) {
  console.error("❌ Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_KEY);

// ─── STEP 1: Discover top products using Gemini + Google Search ──────────────
async function discoverTopProducts() {
  console.log("🔍 Searching for top Amazon India deals today using Gemini + Google Search...\n");

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    timeZone: "Asia/Kolkata",
  });

  // Phase A: Gemini + Google Search → natural language text about products
  const searchModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} }],
  });

  const searchResult = await searchModel.generateContent(
    `Today is ${today}. Search Amazon India (amazon.in) and find ${PRODUCTS_PER_RUN} real trending or best-selling products available right now. For each product find: exact product name, direct Amazon.in URL with ASIN, current price in INR, original MRP in INR, product image URL from m.media-amazon.com, and best category (tech/gadgets/home/kitchen/fashion/study). Focus on products with good discounts.`
  );
  const searchText = searchResult.response.text();
  console.log("   ✅ Search complete. Extracting structured data...");

  // Phase B: Plain Gemini call → extract clean JSON from the search text
  const extractModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const extractResult = await extractModel.generateContent(
    `Extract product details from the text below and return ONLY a raw JSON array (no markdown, no backticks, no explanation).

Rules:
- "asin" must be a 10-character Amazon ASIN code
- "price" and "oldPrice" are plain numbers (no rupee symbol)
- "oldPrice" must be greater than "price" — if unknown, estimate oldPrice = price * 1.5
- "category" must be exactly one of: tech, gadgets, home, kitchen, fashion, study
- "imageUrl" from m.media-amazon.com if available, else empty string ""
- Return up to ${PRODUCTS_PER_RUN} items

Text to extract from:
---
${searchText}
---

Return this exact format:
[{"name":"Product name","asin":"B0XXXXXXXXX","category":"tech","price":1299,"oldPrice":2999,"imageUrl":"https://m.media-amazon.com/images/I/XXXXX._SX679_.jpg"}]`
  );

  let raw = extractResult.response.text().trim();
  raw = raw.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/\s*```$/m, "");

  const arrayMatch = raw.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    console.error("Raw extraction response (first 500 chars):", raw.substring(0, 500));
    throw new Error("Could not extract a JSON array from Gemini response.");
  }

  const products = JSON.parse(arrayMatch[0]);
  const valid = products.filter(p => p.name && p.asin && p.price > 0);
  console.log(`   ✅ Extracted ${valid.length} valid product(s).\n`);
  return valid;

// ─── STEP 2: Generate full SEO review content ────────────────────────────────

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
  "title": "catchy SEO title with product name, key benefit, and review keyword (max 80 chars)",
  "description": "2-3 sentences describing the product with key benefits and India context",
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

  // Extract first JSON object
  const objMatch = raw.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error("Invalid JSON from Gemini review generator");

  return JSON.parse(objMatch[0]);
}

// ─── STEP 3: Check for duplicates ────────────────────────────────────────────
function loadExistingContent() {
  return fs.readFileSync(PRODUCTS_FILE, "utf8");
}

function isAlreadyAdded(existingContent, asin, productName) {
  // Check by ASIN in URL or by product name (partial match)
  if (asin && existingContent.includes(asin)) return true;
  // Check by first 30 chars of product name (slug will contain it)
  const nameSlug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(" ")
    .slice(0, 4)
    .join("-");
  if (existingContent.includes(nameSlug)) return true;
  return false;
}

// ─── STEP 4: Build product TypeScript entry ───────────────────────────────────
function buildProductEntry(discoveredProduct, reviewData) {
  const affiliateLink = `https://www.amazon.in/dp/${discoveredProduct.asin}?tag=${AMAZON_TAG}`;

  // Escape any double quotes in strings to avoid breaking the TS file
  const safe = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  return `{
    slug: "${safe(reviewData.slug)}",
    title: "${safe(reviewData.title)}",
    image: "${safe(discoveredProduct.imageUrl || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80`)}",
    category: "${safe(discoveredProduct.category.toLowerCase())}",
    description: "${safe(reviewData.description)}",
    price: ${discoveredProduct.price},
    oldPrice: ${discoveredProduct.oldPrice || discoveredProduct.price},
    rating: ${reviewData.rating || 4.3},
    reviewCount: ${reviewData.reviewCount || 1200},
    affiliateLink: "${affiliateLink}",
    features: ${JSON.stringify(reviewData.features || [])},
    pros: ${JSON.stringify(reviewData.pros || [])},
    cons: ${JSON.stringify(reviewData.cons || [])},
    featured: false,
    trending: true,
    dealOfTheDay: ${discoveredProduct.oldPrice > discoveredProduct.price * 1.3},
    tags: ${JSON.stringify(reviewData.tags || [])},
  }`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function run() {
  console.log("🚀 SmartPicks Auto-Discovery — Starting...");
  console.log(`📅 Date: ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}\n`);

  // Step 1: Discover products
  const discovered = await discoverTopProducts();

  // Step 2: Load existing products.ts
  let existingContent = loadExistingContent();
  let addedCount = 0;

  for (const product of discovered) {
    const asin = product.asin?.trim();
    const name = product.name?.trim();

    if (!asin || !name || !product.price) {
      console.log(`⚠️  Skipping incomplete product entry: ${name || "unknown"}`);
      continue;
    }

    // Step 3: Duplicate check
    if (isAlreadyAdded(existingContent, asin, name)) {
      console.log(`⏭️  Already in products.ts — Skipping: ${name}`);
      continue;
    }

    console.log(`\n📦 Processing: ${name}`);
    console.log(`   ASIN: ${asin} | Category: ${product.category} | Price: ₹${product.price}`);

    try {
      // Step 4: Generate review content
      console.log("   🤖 Generating SEO review content...");
      const reviewData = await generateReviewContent(product);
      console.log(`   📝 Slug: ${reviewData.slug}`);

      // Step 5: Build TS entry
      const newEntry = buildProductEntry(product, reviewData);

      // Step 6: Insert before the closing ]; of the products array
      existingContent = existingContent.replace(
        /\]\s*;\s*$/,
        `,\n  ${newEntry}\n];\n`
      );

      addedCount++;
      console.log(`   ✅ Added: ${name}`);

      // Small delay to be kind to the Gemini API
      await new Promise((r) => setTimeout(r, 1500));

    } catch (err) {
      console.error(`   ❌ Failed for "${name}":`, err.message);
    }
  }

  // Step 7: Write updated file
  if (addedCount > 0) {
    fs.writeFileSync(PRODUCTS_FILE, existingContent, "utf8");
    console.log(`\n🎉 Done! Added ${addedCount} new product(s) to data/products.ts`);
    console.log("   Vercel will auto-redeploy with the new listings.");
  } else {
    console.log("\n✨ No new products to add today — all discovered products already exist.");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

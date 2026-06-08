import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

// 1. Setup Environment & Keys
const API_KEY = process.env.GEMINI_API_KEY;
const CSV_URL = process.env.SHEET_CSV_URL;

if (!API_KEY || !CSV_URL) {
  console.error("Missing GEMINI_API_KEY or SHEET_CSV_URL environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

// Sleep utility function
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry logic with exponential backoff for Gemini API
async function generateContentWithRetry(prompt, retries = 3, initialDelay = 15000) {
  let delay = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const errMsg = err.message || "";
      const isRateLimit = errMsg.includes("429") || JSON.stringify(err).includes("429");
      if (isRateLimit && i < retries - 1) {
        console.warn(`⚠️ Gemini rate limit (429) hit. Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`);
        await sleep(delay);
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
}

// Local programmatic fallback content generator if Gemini fails completely
function generateFallbackContent(productName, category, price, oldPrice, affiliateLink) {
  console.log(`ℹ️ Generating local fallback content for: ${productName}`);
  
  let slug = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 60)        // max 60 chars to prevent mega-long slugs
    .replace(/-+$/, "");     // remove trailing dash after truncation
  
  if (!slug.endsWith("-review")) {
    slug += "-review";
  }

  const cleanCategory = (category || "tech").trim();
  const title = `${productName} Review: Is This Your Next Best Pick?`;
  const description = `Discover our comprehensive review of the ${productName}. We examine its key features, pros, cons, and real-world performance in the ${cleanCategory} segment to see if it delivers real value.`;
  
  const tags = [
    cleanCategory.toLowerCase(),
    "product review",
    "smart picks",
    ...productName.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 4)
  ];

  const features = [
    "High-performance design optimized for daily tasks and productivity.",
    "Comfortable, ergonomic build offering excellent durability.",
    "Modern aesthetic and premium finish in its price category.",
    "Seamless integration and simple, user-friendly controls.",
    "Efficient power management and reliability under standard usage."
  ];

  const pros = [
    "Great value for money offering robust performance.",
    "Premium design elements make it stand out visually.",
    "Highly reliable build quality backed by top standards."
  ];

  const cons = [
    "May lack some specialized features found on ultra-premium models.",
    "Price fluctuations are common during peak high-demand sales."
  ];

  const pinterestCaption = `Looking for an honest review of the ${productName}? 🛍️ We break down the top features, pros, cons, and performance of this ${cleanCategory} pick to see if it's worth your money. Read the full review now! #${slug.replace(/-review$/, "").replace(/-/g, "")} #${cleanCategory.replace(/\s+/g, "")} #ProductReview #AffiliateDeals`;

  return {
    slug,
    title,
    description,
    price: price || 0,
    oldPrice: oldPrice || price || 0,
    rating: 4.4,
    reviewCount: 1200,
    features,
    pros,
    cons,
    tags,
    pinterestCaption
  };
}

async function run() {
  console.log("Fetching CSV from Google Sheets...");
  const response = await fetch(CSV_URL);
  const csvText = await response.text();

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true
  });

  console.log(`Found ${records.length} total rows in CSV.`);

  const productsFilePath = path.join(process.cwd(), "data", "products.ts");
  let existingProductsContent = fs.readFileSync(productsFilePath, "utf8");

  const captionsFilePath = path.join(process.cwd(), "pinterest-captions.md");
  if (!fs.existsSync(captionsFilePath)) fs.writeFileSync(captionsFilePath, "# Pinterest Captions\n\n");

  let newProductsAdded = 0;
  let isFirstNewProduct = true;

  for (const record of records) {
    const productName = record["Product Name"];
    const affiliateLink = record["Amazon URL"];
    const category = record["Category"] || "tech";
    const imageUrl = record["Image URL"];

    // ── Read prices directly from the sheet (avoids AI hallucination) ──────
    const sheetPrice    = parseFloat(record["Price"] || "");
    const sheetOldPrice = parseFloat(record["Old Price"] || "");
    const hasPriceFromSheet = !isNaN(sheetPrice) && sheetPrice > 0;

    if (!productName || !affiliateLink) continue;

    // Check if affiliateLink is already in products.ts
    if (existingProductsContent.includes(affiliateLink)) {
      console.log(`Skipping: ${productName} (Already exists)`);
      continue;
    }

    // Rate Limit Spacing: wait 5 seconds before subsequent Gemini API requests
    if (!isFirstNewProduct) {
      console.log("Waiting 5 seconds to respect Gemini API rate limits...");
      await sleep(5000);
    }
    isFirstNewProduct = false;

    console.log(`Generating content for: ${productName}...`);

    let data;
    try {
      // Build price instruction for Gemini — only ask it to estimate if not in sheet
      const priceInstruction = hasPriceFromSheet
        ? `The current selling price is ₹${sheetPrice}${!isNaN(sheetOldPrice) && sheetOldPrice > sheetPrice ? ` (original MRP was ₹${sheetOldPrice})` : ". No original MRP available — set oldPrice equal to price."}`
        : `Give a realistic estimate for price in INR and original MRP.`;

      const prompt = `Write an expert SEO optimized affiliate product review for: ${productName}. 
      The product is in the '${category}' category.
      ${priceInstruction}
      Write compelling features, pros, cons, and a Pinterest caption.
      
      You must return ONLY a raw JSON object with the exact following keys and types. Do not include any markdown backticks or explanation:
      {
        "slug": "string-url-friendly-slug",
        "title": "catchy title",
        "description": "2-3 sentences",
        "price": 1299,
        "oldPrice": 2999,
        "rating": 4.4,
        "reviewCount": 1500,
        "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
        "pros": ["pro 1", "pro 2", "pro 3"],
        "cons": ["con 1", "con 2"],
        "tags": ["tag1", "tag2", "tag3"],
        "pinterestCaption": "caption with hashtags"
      }`;

      const rawText = await generateContentWithRetry(prompt, 3, 15000);
      let cleanedText = rawText.trim();
      
      // Clean up markdown code blocks if the AI includes them
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      data = JSON.parse(cleanedText);
    } catch (err) {
      console.error(`❌ Failed to generate content via Gemini for ${productName}:`, err.message || err);
      // Fallback to local programmatic content generation
      data = generateFallbackContent(productName, category, sheetPrice, sheetOldPrice, affiliateLink);
    }

    try {
      // Use sheet prices if available, otherwise fall back to Gemini's estimate
      const finalPrice    = hasPriceFromSheet ? sheetPrice    : data.price;
      const finalOldPrice = hasPriceFromSheet
        ? (!isNaN(sheetOldPrice) && sheetOldPrice > sheetPrice ? sheetOldPrice : sheetPrice)
        : data.oldPrice;

      if (hasPriceFromSheet) {
        console.log(`   💰 Using sheet price: ₹${finalPrice} (was ₹${finalOldPrice})`);
      } else {
        console.log(`   ⚠️  No price in sheet — using generated estimate: ₹${finalPrice}. Add a 'Price' column to your Google Sheet for accurate prices.`);
      }

      // Construct the TS object
      const newProductObj = `{
    slug: "${data.slug}",
    title: "${data.title.replace(/"/g, '\\"')}",
    image: "${imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}",
    category: "${category.toLowerCase()}",
    description: "${data.description.replace(/"/g, '\\"')}",
    price: ${finalPrice},
    oldPrice: ${finalOldPrice},
    rating: ${data.rating},
    reviewCount: ${data.reviewCount},
    affiliateLink: "${affiliateLink}",
    features: ${JSON.stringify(data.features)},
    pros: ${JSON.stringify(data.pros)},
    cons: ${JSON.stringify(data.cons)},
    featured: false,
    trending: true,
    dealOfTheDay: false,
    tags: ${JSON.stringify(data.tags)},
  }`;

      // Add a comma before the new object if it's not the first one
      let separator = ",\n  ";
      if (existingProductsContent.trim().endsWith("[")) {
        separator = "";
      } else if (existingProductsContent.trim().endsWith("},\n];") || existingProductsContent.trim().endsWith("}, ];") || existingProductsContent.trim().endsWith("},];")) {
        // If the last item already had a trailing comma, remove it before adding the separator
        existingProductsContent = existingProductsContent.replace(/},\s*\]\s*;\s*$/, "}\n];\n");
      }

      // Insert before the closing bracket
      existingProductsContent = existingProductsContent.replace(
        /\]\s*;\s*$/,
        `${separator}${newProductObj}\n];\n`
      );

      // Write to pinterest captions
      const pinterestEntry = `\n## ${data.title}\n**URL:** https://smart-picks-india.vercel.app/product/${data.slug}\n**Caption:**\n${data.pinterestCaption}\n`;
      fs.appendFileSync(captionsFilePath, pinterestEntry);

      newProductsAdded++;
      console.log(`✅ Added: ${productName}`);

    } catch (err) {
      console.error(`❌ Failed to parse and add product ${productName}:`, err);
    }
  }

  if (newProductsAdded > 0) {
    fs.writeFileSync(productsFilePath, existingProductsContent);
    console.log(`\n🎉 Successfully added ${newProductsAdded} new products!`);
  } else {
    console.log("\nNo new products found to add.");
  }
}

run();

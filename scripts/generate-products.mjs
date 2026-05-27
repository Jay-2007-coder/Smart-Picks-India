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

  for (const record of records) {
    const productName = record["Product Name"];
    const affiliateLink = record["Amazon URL"];
    const category = record["Category"];
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

    console.log(`Generating content for: ${productName}...`);

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

      const result = await model.generateContent(prompt);
      let rawText = result.response.text();
      
      // Clean up markdown code blocks if the AI includes them
      if (rawText.startsWith('\`\`\`json')) {
        rawText = rawText.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
      } else if (rawText.startsWith('\`\`\`')) {
        rawText = rawText.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');
      }

      const data = JSON.parse(rawText);

      // Use sheet prices if available, otherwise fall back to Gemini's estimate
      const finalPrice    = hasPriceFromSheet ? sheetPrice    : data.price;
      const finalOldPrice = hasPriceFromSheet
        ? (!isNaN(sheetOldPrice) && sheetOldPrice > sheetPrice ? sheetOldPrice : sheetPrice)
        : data.oldPrice;

      if (hasPriceFromSheet) {
        console.log(`   💰 Using sheet price: ₹${finalPrice} (was ₹${finalOldPrice})`);
      } else {
        console.log(`   ⚠️  No price in sheet — using Gemini estimate: ₹${finalPrice}. Add a 'Price' column to your Google Sheet for accurate prices.`);
      }

      // Construct the TS object
      const newProductObj = `{
    slug: "${data.slug}",
    title: "${data.title}",
    image: "${imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}",
    category: "${category.toLowerCase()}",
    description: "${data.description}",
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
      ); // Write to pinterest captions
      const pinterestEntry = `\n## ${data.title}\n**URL:** https://smart-picks-india.vercel.app/product/${data.slug}\n**Caption:**\n${data.pinterestCaption}\n`;
      fs.appendFileSync(captionsFilePath, pinterestEntry);

      newProductsAdded++;
      console.log(`✅ Added: ${productName}`);

    } catch (err) {
      console.error(`❌ Failed to generate content for ${productName}:`, err);
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

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

// We define the schema we want Gemini to return
const productSchema = {
  type: SchemaType.OBJECT,
  properties: {
    slug: { type: SchemaType.STRING, description: "URL friendly slug of the product" },
    title: { type: SchemaType.STRING, description: "Catchy SEO optimized title" },
    description: { type: SchemaType.STRING, description: "A detailed 2-3 sentence review description" },
    price: { type: SchemaType.NUMBER, description: "Estimated discounted price in INR" },
    oldPrice: { type: SchemaType.NUMBER, description: "Estimated original MRP in INR" },
    rating: { type: SchemaType.NUMBER, description: "Estimated Amazon rating e.g. 4.4" },
    reviewCount: { type: SchemaType.NUMBER, description: "Estimated number of reviews" },
    features: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "5 key features" },
    pros: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3-4 pros" },
    cons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "2-3 cons" },
    tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "3-4 category tags" },
    pinterestCaption: { type: SchemaType.STRING, description: "A catchy Pinterest caption for this product with hashtags" }
  },
  required: ["slug", "title", "description", "price", "oldPrice", "rating", "reviewCount", "features", "pros", "cons", "tags", "pinterestCaption"]
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: productSchema,
  }
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

    if (!productName || !affiliateLink) continue;

    // Check if affiliateLink is already in products.ts
    if (existingProductsContent.includes(affiliateLink)) {
      console.log(`Skipping: ${productName} (Already exists)`);
      continue;
    }

    console.log(`Generating content for: ${productName}...`);

    try {
      const prompt = `Write an expert SEO optimized affiliate product review for: ${productName}. 
      The product is in the '${category}' category.
      Give realistic estimates for price in INR, original MRP, rating, and review count.
      Write compelling features, pros, cons, and a Pinterest caption.`;

      const result = await model.generateContent(prompt);
      const data = JSON.parse(result.response.text());

      // Construct the TS object
      const newProductObj = `{
    slug: "${data.slug}",
    title: "${data.title}",
    image: "${imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80'}",
    category: "${category.toLowerCase()}",
    description: "${data.description}",
    price: ${data.price},
    oldPrice: ${data.oldPrice},
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

      // Insert into products.ts before the final ];
      existingProductsContent = existingProductsContent.replace(/];[\s\n]*$/, `  ,\n  ${newProductObj}\n];`);

      // Write to pinterest captions
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

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/Product.js";
import PriceHistory from "../models/PriceHistory.js";
import { parseFullProducts } from "../utils/priceSync.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in environment.");
    process.exit(1);
  }

  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  console.log("Clearing Product and PriceHistory collections...");
  await Product.deleteMany({});
  await PriceHistory.deleteMany({});
  console.log("Cleared collections.");

  console.log("Parsing products from data/products.ts...");
  const catalogProducts = parseFullProducts();
  console.log(`Found ${catalogProducts.length} products to seed.`);

  for (const p of catalogProducts) {
    // Extract ASIN from affiliate link
    const asinMatch = p.affiliateLink.match(/\/dp\/([A-Z0-9]{10})/i) || p.affiliateLink.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    const asin = asinMatch ? asinMatch[1].toUpperCase() : `MANUAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) || 0;

    const newProduct = new Product({
      title: p.title,
      asin,
      category: p.category,
      price: p.price,
      originalPrice: p.oldPrice,
      discount,
      image: p.image,
      rating: p.rating || 4.5,
      reviewCount: p.reviewCount || 100,
      affiliateLink: p.affiliateLink,
      trending: true,
      slug: p.slug,
      description: p.description || "",
      features: p.features || [],
      pros: p.pros || [
        "Great discount on premium performance.",
        "Verified Amazon customer rating.",
        "Fast shipping options in India."
      ],
      cons: p.cons || [
        "Price fluctuations are common; grab it while discounted."
      ],
      tags: p.tags || [p.category, "Amazon Deals", "SmartPicks Choice"],
      featured: true,
      dealOfTheDay: true,
      flashDeal: true,
      flashDealEndsAt: new Date(Date.now() + 3.75 * 60 * 60 * 1000) // active flash deals!
    });

    await newProduct.save();
    console.log(`✅ Seeded Product: "${p.title}" (ASIN: ${asin}, Slug: ${p.slug})`);

    // Inject mock PriceHistory records
    const pricePoints = [];
    const basePrice = p.price;
    for (let i = 4; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * 6);
      const priceOffset = Math.round(basePrice * (1 + (Math.sin(i) * 0.05)));
      pricePoints.push({
        slug: p.slug,
        price: i === 0 ? basePrice : priceOffset,
        date,
      });
    }
    await PriceHistory.insertMany(pricePoints);
    console.log(`   📈 Generated 5 price history records for: ${p.slug}`);
  }

  console.log("🎉 Seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("❌ Seeding failed:", err);
  await mongoose.disconnect();
  process.exit(1);
});

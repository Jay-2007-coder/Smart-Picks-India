import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../../server/models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error("No MONGODB_URI found in .env.local");
    process.exit(1);
  }
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  const products = await Product.find({});
  console.log(`Found ${products.length} products in DB:`);
  products.forEach(p => {
    console.log(`- Title: ${p.title}\n  ASIN: ${p.asin}\n  Slug: ${p.slug}\n  Image: ${p.image}\n  Price: ${p.price}\n  OriginalPrice: ${p.originalPrice}\n  FlashDeal: ${p.flashDeal}\n  FlashDealEndsAt: ${p.flashDealEndsAt}`);
  });
  await mongoose.disconnect();
}
run().catch(console.error);

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../server/models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not configured");
    process.exit(1);
  }
  console.log("Connecting to", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  
  const products = await Product.find({});
  console.log(`Found ${products.length} products in DB:`);
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. Title: "${p.title}" | Slug: "${p.slug}" | Discount: ${p.discount}% | Price: ₹${p.price} | OldPrice: ₹${p.originalPrice}`);
  });
  
  await mongoose.disconnect();
}
run().catch(console.error);

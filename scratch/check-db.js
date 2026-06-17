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
    console.error("❌ MONGODB_URI not found");
    process.exit(1);
  }
  console.log("Connecting to MongoDB at:", MONGODB_URI.replace(/:[^@]+@/, ":****@"));
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  const count = await Product.countDocuments({});
  console.log("Total Products in DB:", count);

  const categories = await Product.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  console.log("Categories breakdown in DB:", categories);

  await mongoose.disconnect();
}

run().catch(console.error);

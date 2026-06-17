import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../server/models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123456_key";
const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI not found");
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const user = await User.findOne({ email: "jaytalekar82@gmail.com" });
  if (!user) {
    console.error("User not found!");
    process.exit(1);
  }

  // Generate accessToken
  const accessToken = jwt.sign({ userId: user._id.toString() }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  console.log("Generated Access Token. Querying /api/v1/auth/me...");

  try {
    const response = await fetch("http://localhost:5000/api/v1/auth/me", {
      headers: {
        cookie: `accessToken=${accessToken}`
      }
    });
    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch request failed:", err);
  }

  await mongoose.disconnect();
}

run().catch(console.error);

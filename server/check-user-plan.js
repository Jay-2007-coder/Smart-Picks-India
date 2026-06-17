import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";

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
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  const user = await User.findOne({ email: "jaytalekar62@gmail.com" });
  if (user) {
    console.log("Current user status:", {
      id: user._id,
      email: user.email,
      hubPlan: user.hubPlan,
      hubPlanExpiresAt: user.hubPlanExpiresAt
    });

    if (!user.hubPlanExpiresAt && user.hubPlan === "pro") {
      user.hubPlanExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await user.save();
      console.log("Updated user plan expiration to:", user.hubPlanExpiresAt);
    }
  } else {
    console.log("User not found!");
  }

  await mongoose.disconnect();
}

run().catch(console.error);

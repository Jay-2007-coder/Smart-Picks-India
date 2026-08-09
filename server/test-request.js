import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "./models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123456_key";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smart-picks-auth";

async function test() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({});
    if (!user) {
      console.error("No user found in database!");
      await mongoose.disconnect();
      return;
    }
    console.log(`Using user: ${user.email} (Plan: ${user.hubPlan}, Role: ${user.role})`);

    const accessToken = jwt.sign({ userId: user._id.toString() }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const res = await fetch("http://localhost:5000/api/v1/student-hub/project-idea-generator", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "cookie": `accessToken=${accessToken}`
      },
      body: JSON.stringify({
        techStack: ["React", "Node.js"],
        level: "Intermediate",
        domain: "web"
      })
    });
    console.log("Status:", res.status);
    console.log("Status Text:", res.statusText);
    const text = await res.text();
    console.log("Response Body:", text);

    await mongoose.disconnect();
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

test();

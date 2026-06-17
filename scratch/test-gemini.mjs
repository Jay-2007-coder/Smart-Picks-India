import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envContent = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
const geminiMatch = envContent.match(/GEMINI_API_KEY\s*=\s*(.+)/);
const API_KEY = geminiMatch ? geminiMatch[1].trim() : null;

async function run() {
  if (!API_KEY) {
    console.error("No GEMINI_API_KEY found in .env.local");
    process.exit(1);
  }
  console.log("Testing Gemini API Key...");
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  try {
    const result = await model.generateContent("Hello, respond in 5 words.");
    console.log("Success! Response:", result.response.text().trim());
  } catch (err) {
    console.error("Gemini API call failed:", err);
  }
}
run();

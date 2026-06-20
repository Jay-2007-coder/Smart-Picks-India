import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config(); // fallbacks

console.log("🔋 Environment variables loaded successfully in loadEnv.js");
console.log("🔑 ACCESS_TOKEN_SECRET in loadEnv.js:", process.env.ACCESS_TOKEN_SECRET ? `${process.env.ACCESS_TOKEN_SECRET.substring(0, 5)}...` : "undefined");

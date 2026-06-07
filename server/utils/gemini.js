import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ensure environment variables are loaded in utility
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.0-pro",
];

export function isQuotaError(errMsg = "") {
  const msg = String(errMsg).toLowerCase();
  return (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("429") ||
    msg.includes("too many requests") ||
    msg.includes("free_tier") ||
    msg.includes("high demand") ||
    msg.includes("temporary") ||
    msg.includes("overloaded") ||
    msg.includes("503") ||
    msg.includes("service unavailable")
  );
}

/**
 * callGemini — tries each model in GEMINI_MODELS cascade.
 * Returns null (triggering mock fallback in route) when all models fail.
 * Supports both raw string userPrompt and structured Gemini array contents.
 */
export async function callGemini(systemPrompt, userPromptOrContents, responseJson = false) {
  if (!GEMINI_API_KEY) {
    console.warn("⚠️  GEMINI_API_KEY not configured. Running AI helper in mock fallback mode.");
    return null;
  }

  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 8192,
    responseMimeType: responseJson ? "application/json" : "text/plain",
  };

  const isContentsArray = Array.isArray(userPromptOrContents);
  const contents = isContentsArray
    ? userPromptOrContents
    : [{ role: "user", parts: [{ text: userPromptOrContents }] }];

  let lastError = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg = data?.error?.message || `HTTP ${response.status}`;
        if (isQuotaError(errMsg) || response.status === 429) {
          console.warn(`⚡ Quota exhausted on ${model}. Trying next model...`);
          lastError = errMsg;
          continue; // try next model
        }
        throw new Error(errMsg); // non-quota error — bubble up
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (text) {
        if (model !== GEMINI_MODELS[0]) {
          console.info(`✅ Served by fallback model: ${model}`);
        }
        return text;
      }

      lastError = "Empty response";
    } catch (err) {
      if (isQuotaError(err.message)) {
        console.warn(`⚡ Quota error on ${model}: ${err.message}. Trying next...`);
        lastError = err.message;
        continue;
      }
      throw err; // re-throw non-quota errors
    }
  }

  // All models exhausted — return null to trigger mock fallback
  console.warn(`🚫 All Gemini models quota-exhausted. Using mock fallback. Last error: ${lastError}`);
  return null;
}

export function cleanGeminiJson(rawText) {
  let cleanText = rawText.trim();
  
  // 1. Try to extract from ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = cleanText.match(codeBlockRegex);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      // If code block contents don't parse, fall back to bracket extraction on the match content
      cleanText = match[1].trim();
    }
  }
  
  // 2. Try to find the outermost JSON object {} or array []
  const firstCurly = cleanText.indexOf("{");
  const lastCurly = cleanText.lastIndexOf("}");
  const firstSquare = cleanText.indexOf("[");
  const lastSquare = cleanText.lastIndexOf("]");
  
  // Try parsing the curly brace matching block first if it exists
  if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
    const curlyCandidate = cleanText.substring(firstCurly, lastCurly + 1);
    try {
      return JSON.parse(curlyCandidate.trim());
    } catch (e) {
      // Continue to other methods if it fails
    }
  }
  
  // Try parsing the square brace matching block if it exists
  if (firstSquare !== -1 && lastSquare !== -1 && lastSquare > firstSquare) {
    const squareCandidate = cleanText.substring(firstSquare, lastSquare + 1);
    try {
      return JSON.parse(squareCandidate.trim());
    } catch (e) {
      // Continue to other methods if it fails
    }
  }
  
  // 3. Fallback to the original index-based extraction logic
  const firstBracket = Math.min(
    cleanText.indexOf("[") === -1 ? Infinity : cleanText.indexOf("["),
    cleanText.indexOf("{") === -1 ? Infinity : cleanText.indexOf("{")
  );
  
  const lastBracket = Math.max(
    cleanText.lastIndexOf("]"),
    cleanText.lastIndexOf("}")
  );
  
  if (firstBracket !== Infinity && lastBracket !== -1 && lastBracket > firstBracket) {
    cleanText = cleanText.substring(firstBracket, lastBracket + 1);
  }
  
  return JSON.parse(cleanText.trim());
}

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

      const parts = data?.candidates?.[0]?.content?.parts || [];
      const textParts = parts.filter(p => !p.thought).map(p => p.text || "");
      const text = textParts.join("").trim();
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
  if (!rawText) return null;
  let cleanText = rawText.trim();
  
  // 1. Try to extract from ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = cleanText.match(codeBlockRegex);
  if (match && match[1]) {
    cleanText = match[1].trim();
  }
  
  // 2. Locate boundaries of the JSON block (outermost curly {} or square [])
  const firstCurly = cleanText.indexOf("{");
  const lastCurly = cleanText.lastIndexOf("}");
  const firstSquare = cleanText.indexOf("[");
  const lastSquare = cleanText.lastIndexOf("]");
  
  let jsonCandidate = cleanText;
  
  if (firstCurly !== -1 && lastCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
    if (lastCurly > firstCurly) {
      jsonCandidate = cleanText.substring(firstCurly, lastCurly + 1);
    }
  } else if (firstSquare !== -1 && lastSquare !== -1) {
    if (lastSquare > firstSquare) {
      jsonCandidate = cleanText.substring(firstSquare, lastSquare + 1);
    }
  }
  
  // 3. Pre-process the JSON candidate to make it valid JSON
  let processed = jsonCandidate.trim();
  
  // Robust String & Comment parser to remove comments and escape literal newlines in strings
  processed = processed.replace(/("(?:[^"\\]|\\.)*")|(\/\/.*)|(\/\*[\s\S]*?\*\/)/g, (match, stringGroup) => {
    if (stringGroup) {
      // Escape literal newlines and carriage returns within string values
      return stringGroup.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
    }
    // Discard comments
    return "";
  });

  // Remove trailing commas before closing brackets/braces
  processed = processed.replace(/,\s*(?=[\]}])/g, "");

  try {
    return JSON.parse(processed);
  } catch (err) {
    console.error("JSON parse failed. Error:", err.message);
    console.error("Processed output was:", processed);
    // Fallback to original cleanText substring parsing in case processing broke something
    return JSON.parse(cleanText.trim());
  }
}


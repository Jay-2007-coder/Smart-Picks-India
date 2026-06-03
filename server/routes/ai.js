import express from "express";
import { callGemini, cleanGeminiJson } from "../utils/gemini.js";

const router = express.Router();

// ──────────────────────────────────────────────────────────────────────────────
// 1. AI PRODUCT RECOMMENDATION ENGINE
// ──────────────────────────────────────────────────────────────────────────────
router.post("/recommend", async (req, res, next) => {
  try {
    const { query, products } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, message: "Query is required." });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(200).json({
        success: true,
        reasoning: "No products available in the catalog to recommend from.",
        recommendations: [],
      });
    }

    // Prepare a slimmed-down version of products for the prompt to save tokens
    const productCatalog = products.map((p) => ({
      slug: p.slug,
      title: p.title || p.name,
      description: p.description,
      category: p.category,
      price: p.price,
      rating: p.rating,
    }));

    const systemPrompt = `You are a premium smart product advisor for Smart Picks India.
Based on the user's natural language request and the provided catalog of products, find the best matching products (up to 5, ordered from best match to worst match).
Output MUST be a raw JSON object with NO markdown tags (no backticks, no markdown formatting).
JSON Schema:
{
  "reasoning": "A short, engaging explanation (2-3 sentences) detailing how these recommendations solve the user's need, specifically highlighting India context (e.g. price/value).",
  "recommendations": [
    {
      "slug": "product-slug-from-catalog",
      "reason": "A 1-sentence reason why this product is selected for their query."
    }
  ]
}`;

    const userPrompt = `User Query: "${query}"
Product Catalog:
${JSON.stringify(productCatalog, null, 2)}`;

    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini AI recommendation error:", aiErr.message);
    }

    if (!aiOutput) {
      // Mock Fallback
      // Filter products by category or text match as fallback
      const keywords = query.toLowerCase().split(/\s+/);
      let matched = products.filter((p) => {
        const title = (p.title || p.name || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        return keywords.some((k) => title.includes(k) || desc.includes(k) || cat.includes(k));
      });

      if (matched.length === 0) {
        matched = products.slice(0, 3); // Default to first 3 products
      } else {
        matched = matched.slice(0, 4);
      }

      const fallbackResult = {
        reasoning: `Based on your request, we searched our catalog for relevant items. Here are some options that match your query:`,
        recommendations: matched.map((p) => ({
          slug: p.slug,
          reason: `Features solid build and high performance matching your budget requirements.`,
        })),
        isFallback: true,
      };

      return res.status(200).json({ success: true, ...fallbackResult });
    }

    try {
      const recommendationsResult = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, ...recommendationsResult });
    } catch (parseErr) {
      console.error("AI Recommendation parsing failed:", parseErr.message, "\nRaw:", aiOutput);
      // Fallback in case of invalid JSON formatting
      res.status(200).json({
        success: true,
        reasoning: "Here are some top picks that match your query from our catalog:",
        recommendations: products.slice(0, 3).map((p) => ({
          slug: p.slug,
          reason: "Matches your query with great features.",
        })),
      });
    }
  } catch (err) {
    next(err);
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// 2. AI PRODUCT COMPARE TOOL
// ──────────────────────────────────────────────────────────────────────────────
router.post("/compare", async (req, res, next) => {
  try {
    const { products } = req.body;

    if (!products || !Array.isArray(products) || products.length < 2) {
      return res.status(400).json({ success: false, message: "At least 2 products are required for comparison." });
    }

    const systemPrompt = `You are an expert product comparison engine for Smart Picks India.
Compare the given products in details. Decide key comparison specs (e.g. Price, Performance, Battery, Design, Value for Money, etc.) and rate them or provide concise values for each product.
Also determine custom awards for products (e.g. "Best Overall", "Best Budget Option", "Most Features", etc.).
Provide a comprehensive verdict comparing their pros/cons and recommending who should buy which.
Output MUST be a raw JSON object with NO markdown formatting (no backticks, no code block fences).
JSON Schema:
{
  "verdict": "Detailed summary explaining the comparative analysis and final recommendation (3-4 sentences).",
  "specs": [
    {
      "name": "Specification Name (e.g., Battery Life, Performance)",
      "values": ["Value for Product 1", "Value for Product 2", "Value for Product 3"]
    }
  ],
  "awards": [
    {
      "slug": "product-slug",
      "award": "Award title (e.g., Best Value)"
    }
  ]
}`;

    const userPrompt = `Compare the following products:
${JSON.stringify(products, null, 2)}`;

    let aiOutput = null;
    try {
      aiOutput = await callGemini(systemPrompt, userPrompt, true);
    } catch (aiErr) {
      console.error("Gemini AI comparison error:", aiErr.message);
    }

    if (!aiOutput) {
      // Mock Fallback
      const specs = [
        { name: "Category", values: products.map((p) => p.category) },
        { name: "Price", values: products.map((p) => `₹${p.price.toLocaleString("en-IN")}`) },
        { name: "Rating", values: products.map((p) => `${p.rating} / 5`) },
        { name: "Reviews Count", values: products.map((p) => `${p.reviewCount}+ reviews`) },
      ];

      const awards = [
        { slug: products[0].slug, award: "Best Choice" },
        { slug: products[1].slug, award: "Great Value" },
      ];

      const fallbackResult = {
        verdict: `A comparison of ${products.map((p) => p.title || p.name).join(" vs ")}. Both models offer exceptional performance and features. The first model is recommended for general requirements, while the second model represents excellent value.`,
        specs,
        awards,
        isFallback: true,
      };

      return res.status(200).json({ success: true, ...fallbackResult });
    }

    try {
      const comparisonResult = cleanGeminiJson(aiOutput);
      res.status(200).json({ success: true, ...comparisonResult });
    } catch (parseErr) {
      console.error("AI Comparison parsing failed:", parseErr.message, "\nRaw:", aiOutput);
      res.status(500).json({ success: false, message: "Failed to parse comparison details." });
    }
  } catch (err) {
    next(err);
  }
});

export default router;

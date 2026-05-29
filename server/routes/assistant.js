import express from "express";
import { parseFullProducts } from "../utils/priceSync.js";

const router = express.Router();

router.post("/chat", async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required." });
    }

    const products = parseFullProducts();
    const systemPrompt = `You are the Gemini AI Shopping Assistant for SmartPicks India (a premium smart product deals website).
You help users find the best deals, compare prices, and choose the right products.
Here is the catalog of currently available products on our website:
${JSON.stringify(
  products.map((p) => ({
    title: p.title,
    slug: p.slug,
    price: p.price,
    oldPrice: p.oldPrice,
    category: p.category,
    description: p.description,
    rating: p.rating,
  })),
  null,
  2
)}

Guidelines:
1. Recommend relevant products from the list above.
2. ALWAYS provide links to the product detail pages on our site using relative URLs like /product/slug. For example: [Apple iPhone 15](/product/apple-iphone-15-128gb-black-review) or [Boat Airdopes Plus 311](/product/boat-airdopes-plus-311-wireless-earbuds-review).
3. If the user is looking for deals, highlight items with the largest discount (oldPrice - price).
4. Keep your responses concise, helpful, and formatted in Markdown.
5. If no products in the catalog match the request, politely suggest the closest match or invite them to browse our categories.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Mock / fallback response if API key is not configured
      console.warn("⚠️ GEMINI_API_KEY not configured. Falling back to mock assistant response.");
      
      let reply = "Hello! I am the SmartPicks Shopping Assistant. Currently, I am running in demo mode. Here are some of our hottest deals:\n\n";
      
      const sortedDeals = [...products]
        .map(p => ({ ...p, discount: p.oldPrice - p.price }))
        .sort((a, b) => b.discount - a.discount)
        .slice(0, 3);
        
      sortedDeals.forEach(d => {
        reply += `- **[${d.title}](/product/${d.slug})**: Now ₹${d.price} (Was ₹${d.oldPrice}, save ₹${d.oldPrice - d.price}!)\n`;
      });
      
      reply += "\nHow can I help you find your next purchase today?";
      return res.status(200).json({ success: true, reply });
    }

    // Convert history to Gemini API format
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP status ${response.status}`);
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't formulate a reply. Please try again.";
    
    res.status(200).json({ success: true, reply });
  } catch (err) {
    console.error("❌ Gemini API Error:", err.message);
    // Graceful fallback on API error
    res.status(200).json({
      success: true,
      reply: "Oops! I encountered an issue connecting to my brain. However, you can still view our top deal: [Apple iPhone 15](/product/apple-iphone-15-128gb-black-review) is currently on sale for ₹59,900!",
    });
  }
});

export default router;

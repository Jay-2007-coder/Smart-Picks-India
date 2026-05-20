/**
 * SmartPicks India — Automated Pinterest Poster
 * -----------------------------------------------
 * Reads Google Sheet CSV → generates pin image via Canvas →
 * uploads to ImgBB → posts to Pinterest API.
 * Runs 2x/day via GitHub Actions (3 pins per run = 6 pins/day).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { parse } from "csv-parse/sync";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Environment Variables ────────────────────────────────────────────────────
const GEMINI_API_KEY     = process.env.GEMINI_API_KEY;
const SHEET_CSV_URL      = process.env.SHEET_CSV_URL;
const PINTEREST_TOKEN    = process.env.PINTEREST_TOKEN;
const IMGBB_API_KEY      = process.env.IMGBB_API_KEY;

// Board IDs: one default + per-category overrides
const BOARD_IDS = {
  tech:    process.env.PINTEREST_BOARD_TECH    || process.env.PINTEREST_BOARD_ID,
  kitchen: process.env.PINTEREST_BOARD_KITCHEN || process.env.PINTEREST_BOARD_ID,
  home:    process.env.PINTEREST_BOARD_HOME    || process.env.PINTEREST_BOARD_ID,
  gadgets: process.env.PINTEREST_BOARD_GADGETS || process.env.PINTEREST_BOARD_ID,
  fashion: process.env.PINTEREST_BOARD_FASHION || process.env.PINTEREST_BOARD_ID,
  study:   process.env.PINTEREST_BOARD_STUDY   || process.env.PINTEREST_BOARD_ID,
};

const PINS_PER_RUN = 3;         // 2 runs × 3 pins = 6 pins/day
const SITE_URL     = "https://smart-picks-india.vercel.app";
const POSTED_FILE  = path.join(process.cwd(), "data", "pinterest-posted.json");

// ─── Brand Design Tokens ─────────────────────────────────────────────────────
const BRAND = {
  red:        "#E53E3E",
  redDark:    "#C53030",
  dark:       "#1A202C",
  darkCard:   "#2D3748",
  orange:     "#DD6B20",
  gold:       "#ECC94B",
  white:      "#FFFFFF",
  lightGray:  "#EDF2F7",
  textGray:   "#A0AEC0",
};

// ─── Validate Environment ─────────────────────────────────────────────────────
function validateEnv() {
  const required = { GEMINI_API_KEY, SHEET_CSV_URL, PINTEREST_TOKEN, IMGBB_API_KEY };
  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}`);
    process.exit(1);
  }
  if (!process.env.PINTEREST_BOARD_ID) {
    console.error("❌ Missing PINTEREST_BOARD_ID (default board). Set it in GitHub Secrets.");
    process.exit(1);
  }
}

// ─── Load / Save Posted Tracker ───────────────────────────────────────────────
function loadPostedSlugs() {
  if (!fs.existsSync(POSTED_FILE)) return new Set();
  const data = JSON.parse(fs.readFileSync(POSTED_FILE, "utf8"));
  return new Set(data.posted || []);
}

function savePostedSlugs(slugSet) {
  const data = { posted: [...slugSet], lastUpdated: new Date().toISOString() };
  fs.writeFileSync(POSTED_FILE, JSON.stringify(data, null, 2));
}

// ─── Gemini: Generate Pin Title + Description ─────────────────────────────────
async function generatePinContent(productName, category, price, oldPrice) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const hasDiscount = oldPrice && oldPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : null;

  const prompt = `You are a Pinterest marketing expert for SmartPicks India, an Amazon affiliate site.
Write a viral Pinterest pin for: "${productName}" in category: ${category}.
${hasDiscount ? `It has a ${discountPct}% discount — current price ₹${price} (was ₹${oldPrice}).` : `Price: ₹${price}`}

Return ONLY a raw JSON object (no backticks, no markdown):
{
  "title": "60-char max Pinterest pin title with emoji, urgency, and benefit",
  "description": "150-200 char pin description. Mention the deal, benefits, India context. End with 5 relevant hashtags like #AmazonIndia #TechDeals #SmartPicksIndia"
}`;

  const result = await model.generateContent(prompt);
  let raw = result.response.text().trim();
  raw = raw.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/\s*```$/m, "");
  return JSON.parse(raw);
}

// ─── Canvas: Draw 1000×1500 Pin Image ─────────────────────────────────────────
async function generatePinImage(product) {
  const W = 1000, H = 1500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // ── Background gradient ──────────────────────────────────────────────────
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0,   BRAND.dark);
  grad.addColorStop(0.5, BRAND.darkCard);
  grad.addColorStop(1,   "#0D1117");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // ── Top brand bar ────────────────────────────────────────────────────────
  ctx.fillStyle = BRAND.red;
  ctx.fillRect(0, 0, W, 90);
  ctx.fillStyle = BRAND.white;
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✦ SmartPicks India ✦", W / 2, 60);

  // ── Tagline ──────────────────────────────────────────────────────────────
  ctx.fillStyle = BRAND.textGray;
  ctx.font = "22px sans-serif";
  ctx.fillText("Best Amazon Deals in India", W / 2, 130);

  // ── Product image ────────────────────────────────────────────────────────
  const imgY = 155, imgH = 700;
  try {
    const img = await loadImage(product.imageUrl);
    // Draw card background
    ctx.fillStyle = BRAND.white;
    roundRect(ctx, 40, imgY, W - 80, imgH, 24);
    ctx.fill();
    // Draw image (object-fit: contain within card)
    const aspect = img.width / img.height;
    let drawW = W - 120, drawH = drawW / aspect;
    if (drawH > imgH - 40) { drawH = imgH - 40; drawW = drawH * aspect; }
    ctx.drawImage(img, (W - drawW) / 2, imgY + (imgH - drawH) / 2, drawW, drawH);
  } catch {
    // Fallback if image fails to load
    ctx.fillStyle = BRAND.darkCard;
    roundRect(ctx, 40, imgY, W - 80, imgH, 24);
    ctx.fill();
    ctx.fillStyle = BRAND.textGray;
    ctx.font = "bold 40px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🛍️ " + product.name.substring(0, 25), W / 2, imgY + imgH / 2);
  }

  // ── Discount badge (top-right of image) ──────────────────────────────────
  if (product.discountPct && product.discountPct >= 5) {
    const bx = W - 40, by = imgY + 16;
    ctx.fillStyle = BRAND.gold;
    ctx.beginPath();
    ctx.arc(bx - 55, by + 55, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BRAND.dark;
    ctx.font = "bold 30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${product.discountPct}%`, bx - 55, by + 48);
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("OFF", bx - 55, by + 75);
  }

  // ── Category pill ────────────────────────────────────────────────────────
  const catY = imgY + imgH + 28;
  ctx.fillStyle = BRAND.red;
  roundRect(ctx, 60, catY, 200, 44, 22);
  ctx.fill();
  ctx.fillStyle = BRAND.white;
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("🏷️  " + product.category.toUpperCase(), 80, catY + 30);

  // ── Product name ──────────────────────────────────────────────────────────
  ctx.fillStyle = BRAND.white;
  ctx.textAlign = "center";
  const nameY = catY + 70;
  const name = product.name;
  const nameLines = wrapText(ctx, name, W - 100, "bold 38px sans-serif");
  nameLines.slice(0, 3).forEach((line, i) => {
    ctx.font = "bold 38px sans-serif";
    ctx.fillText(line, W / 2, nameY + i * 52);
  });

  // ── Price section ─────────────────────────────────────────────────────────
  const priceY = nameY + nameLines.slice(0, 3).length * 52 + 36;

  // Old price struck through
  if (product.oldPrice && product.oldPrice > product.price) {
    ctx.fillStyle = BRAND.textGray;
    ctx.font = "28px sans-serif";
    const oldPriceText = `₹${product.oldPrice.toLocaleString("en-IN")}`;
    const oldW = ctx.measureText(oldPriceText).width;
    ctx.fillText(oldPriceText, W / 2, priceY);
    ctx.strokeStyle = BRAND.textGray;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - oldW / 2, priceY - 8);
    ctx.lineTo(W / 2 + oldW / 2, priceY - 8);
    ctx.stroke();
  }

  // Current price
  const curPriceY = product.oldPrice && product.oldPrice > product.price ? priceY + 58 : priceY;
  ctx.fillStyle = BRAND.gold;
  ctx.font = "bold 72px sans-serif";
  ctx.fillText(`₹${product.price.toLocaleString("en-IN")}`, W / 2, curPriceY);

  // ── CTA button ────────────────────────────────────────────────────────────
  const ctaY = H - 175;
  const ctaW = 520, ctaH = 80;
  ctx.fillStyle = BRAND.red;
  roundRect(ctx, (W - ctaW) / 2, ctaY, ctaW, ctaH, 40);
  ctx.fill();
  ctx.fillStyle = BRAND.white;
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🛒  Shop on Amazon →", W / 2, ctaY + 52);

  // ── Bottom URL ────────────────────────────────────────────────────────────
  ctx.fillStyle = BRAND.textGray;
  ctx.font = "24px sans-serif";
  ctx.fillText(SITE_URL, W / 2, H - 55);

  // ── Horizontal accent lines ───────────────────────────────────────────────
  ctx.strokeStyle = BRAND.red;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(60, H - 105); ctx.lineTo(W - 60, H - 105); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(60, 95);      ctx.lineTo(W - 60, 95);      ctx.stroke();

  return canvas.toBuffer("image/png");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, maxWidth, font) {
  ctx.font = font;
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── Upload to ImgBB ──────────────────────────────────────────────────────────
async function uploadToImgBB(imageBuffer) {
  const base64 = imageBuffer.toString("base64");
  const formData = new URLSearchParams();
  formData.append("key", IMGBB_API_KEY);
  formData.append("image", base64);
  formData.append("expiration", "0"); // Never expire

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(`ImgBB upload failed: ${JSON.stringify(json)}`);
  return json.data.url; // Direct image URL
}

// ─── Pinterest: Post Pin ──────────────────────────────────────────────────────
async function postToPinterest({ boardId, imageUrl, title, description, linkUrl }) {
  const body = {
    board_id:   boardId,
    media_source: { source_type: "image_url", url: imageUrl },
    title:       title.substring(0, 100),
    description: description.substring(0, 500),
    link:        linkUrl,
  };

  const res = await fetch("https://api.pinterest.com/v5/pins", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PINTEREST_TOKEN}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`Pinterest API error ${res.status}: ${JSON.stringify(json)}`);
  return json;
}

// ─── Main Runner ──────────────────────────────────────────────────────────────
async function run() {
  validateEnv();

  console.log("📋 Fetching Google Sheet CSV...");
  const csvRes = await fetch(SHEET_CSV_URL);
  const csvText = await csvRes.text();
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  console.log(`Found ${records.length} rows in sheet.`);

  const postedSlugs = loadPostedSlugs();
  console.log(`Already posted: ${postedSlugs.size} products`);

  // Filter rows that haven't been posted yet
  // Supports both "pinterest_posted" column AND our JSON tracker
  const pending = records.filter((r) => {
    const productName = r["Product Name"];
    const affiliateLink = r["Amazon URL"];
    if (!productName || !affiliateLink) return false;

    // If the sheet has the column and it's marked "yes", skip
    const sheetPosted = (r["pinterest_posted"] || "").toLowerCase();
    if (sheetPosted === "yes" || sheetPosted === "true") return false;

    // Check our local tracker using a stable key (the Amazon URL)
    const key = affiliateLink.trim();
    if (postedSlugs.has(key)) {
      console.log(`⏭️  Skipping (already posted): ${productName}`);
      return false;
    }
    return true;
  });

  console.log(`\n🎯 ${pending.length} product(s) ready to pin. Will post up to ${PINS_PER_RUN}.\n`);

  let pinCount = 0;

  for (const record of pending) {
    if (pinCount >= PINS_PER_RUN) break;

    const productName  = record["Product Name"].trim();
    const affiliateLink = record["Amazon URL"].trim();
    const category     = (record["Category"] || "tech").toLowerCase();
    const imageUrl     = record["Image URL"]?.trim() || "";
    const priceRaw     = parseFloat(record["Price"] || "0");
    const oldPriceRaw  = parseFloat(record["Old Price"] || "0");

    // Derive board ID
    const boardId = BOARD_IDS[category] || process.env.PINTEREST_BOARD_ID;
    if (!boardId) {
      console.warn(`⚠️  No board ID found for category "${category}". Skipping.`);
      continue;
    }

    console.log(`\n📌 Processing: ${productName}`);
    console.log(`   Category: ${category} → Board: ${boardId}`);

    try {
      // 1. Generate AI pin title + description
      console.log("   🤖 Generating pin content with Gemini...");
      const pinContent = await generatePinContent(productName, category, priceRaw, oldPriceRaw);
      console.log(`   📝 Title: ${pinContent.title}`);

      // 2. Generate pin image
      console.log("   🎨 Drawing 1000×1500 pin image...");
      const discountPct = oldPriceRaw > priceRaw
        ? Math.round((1 - priceRaw / oldPriceRaw) * 100)
        : null;

      const imgBuffer = await generatePinImage({
        name:        productName,
        imageUrl:    imageUrl,
        category:    category,
        price:       priceRaw || null,
        oldPrice:    oldPriceRaw || null,
        discountPct: discountPct,
      });

      // 3. Upload to ImgBB
      console.log("   ☁️  Uploading to ImgBB...");
      const hostedImageUrl = await uploadToImgBB(imgBuffer);
      console.log(`   ✅ Image URL: ${hostedImageUrl}`);

      // 4. Build product page link (best-guess slug from existing products.ts)
      //    Falls back to the affiliate link if no slug match
      const slugGuess = productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 60);
      const productPageUrl = `${SITE_URL}/product/${slugGuess}`;

      // 5. Post to Pinterest
      console.log("   📌 Posting to Pinterest...");
      const pin = await postToPinterest({
        boardId,
        imageUrl:    hostedImageUrl,
        title:       pinContent.title,
        description: pinContent.description,
        linkUrl:     productPageUrl,
      });
      console.log(`   🎉 Pin created! ID: ${pin.id}`);

      // 6. Mark as posted
      postedSlugs.add(affiliateLink.trim());
      pinCount++;

    } catch (err) {
      console.error(`   ❌ Failed for "${productName}":`, err.message);
    }
  }

  // Save tracker to file (GitHub Action will commit this)
  savePostedSlugs(postedSlugs);

  console.log(`\n🏁 Done! Posted ${pinCount} pin(s) this run.`);
  if (pinCount === 0 && pending.length === 0) {
    console.log("💤 Nothing new to post. Add more rows to your Google Sheet!");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

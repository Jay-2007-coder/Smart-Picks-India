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

// Helper to delay execution to avoid rate limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// ─── Parse pinterest-captions.md for product URLs + captions ─────────────────
function loadCaptionsMap() {
  const captionsFile = path.join(process.cwd(), "pinterest-captions.md");
  if (!fs.existsSync(captionsFile)) return {};
  const text = fs.readFileSync(captionsFile, "utf8");

  const map = {}; // key: normalised product name → { url, caption }
  const sections = text.split(/^## /m).slice(1); // split on each h2 heading
  for (const section of sections) {
    const lines = section.split("\n");
    // First line is the heading title
    const heading = lines[0].trim();
    // Find **URL:** line
    const urlLine  = lines.find(l => l.startsWith("**URL:**"));
    // Find **Caption:** line — caption is the NEXT non-empty line after it
    const capIdx   = lines.findIndex(l => l.startsWith("**Caption:**"));
    const caption  = capIdx >= 0
      ? lines.slice(capIdx + 1).find(l => l.trim().length > 0) || ""
      : "";

    if (!urlLine) continue;
    const url = urlLine.replace("**URL:**", "").trim();

    // Normalise the heading for fuzzy matching (lowercase, only alphanum)
    const key = heading.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
    map[key] = { url, caption: caption.trim() };
  }
  return map;
}

// Fuzzy match: find best caption entry for a given product name
function findCaptionEntry(captionsMap, productName) {
  const needle = productName.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();

  let bestKey = null;
  let bestScore = 0;

  for (const key of Object.keys(captionsMap)) {
    // Count how many words from needle appear in key
    const needleWords = needle.split(" ").filter(w => w.length > 3);
    const matches = needleWords.filter(w => key.includes(w)).length;
    const score = needleWords.length > 0 ? matches / needleWords.length : 0;
    if (score > bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }

  // Require at least 40% of words to match
  if (bestScore >= 0.4 && bestKey) {
    return captionsMap[bestKey];
  }
  return null;
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
  const hasDiscount = oldPrice && oldPrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / oldPrice) * 100) : null;

  // Local fallback generator function to handle Gemini errors/quota limits
  const getFallback = () => {
    console.log("   ⚠️ Using programmatic fallback pin content due to Gemini API rate limit or error.");
    const emojiMap = {
      tech: "💻",
      kitchen: "🍳",
      home: "🏠",
      gadgets: "🔌",
      fashion: "👗",
      study: "📚"
    };
    const emoji = emojiMap[category] || "🛍️";
    const title = `${emoji} Deal: ${productName.substring(0, 40)}...`;
    let description = `Check out this amazing find on SmartPicks India: ${productName}. `;
    if (price && hasDiscount && oldPrice) {
      description += `Save ${discountPct}% off! Now only ₹${price.toLocaleString("en-IN")} (was ₹${oldPrice.toLocaleString("en-IN")}). `;
    } else if (price) {
      description += `Get it now for just ₹${price.toLocaleString("en-IN")}. `;
    } else {
      description += `Check out the latest price and details today! `;
    }
    description += `Find the best handpicked deals, ratings, and recommendations in India. #AmazonIndia #SmartPicksIndia #Deals #${category}`;
    return {
      title: title.substring(0, 100),
      description: description.substring(0, 500)
    };
  };

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a Pinterest marketing expert for SmartPicks India, an Amazon affiliate site.
Write a viral Pinterest pin for: "${productName}" in category: ${category}.
${hasDiscount ? `It has a ${discountPct}% discount — current price ₹${price} (was ₹${oldPrice}).` : `Price: ₹${price}`}

Return ONLY a raw JSON object (no backticks, no markdown):
{
  "title": "60-char max Pinterest pin title with emoji, urgency, and benefit",
  "description": "150-200 char pin description. Mention the deal, benefits, India context. End with 5 relevant hashtags like #AmazonIndia #TechDeals #SmartPicksIndia"
}`;

  let attempts = 0;
  const maxAttempts = 2;
  while (attempts < maxAttempts) {
    try {
      const result = await model.generateContent(prompt);
      let raw = result.response.text().trim();
      raw = raw.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/\s*```$/m, "");
      const parsed = JSON.parse(raw);
      if (parsed.title && parsed.description) {
        return parsed;
      }
      throw new Error("Invalid response JSON structure");
    } catch (err) {
      attempts++;
      console.warn(`   ⚠️ Gemini API attempt ${attempts} failed: ${err.message}`);
      if (attempts < maxAttempts) {
        const isQuota = err.message.includes("429") || err.message.toLowerCase().includes("quota") || err.message.toLowerCase().includes("rate limit");
        const waitTime = isQuota ? 10000 : 3000;
        console.log(`   ⏳ Waiting ${waitTime / 1000}s before retrying...`);
        await sleep(waitTime);
      }
    }
  }

  // If all attempts fail, return the fallback
  return getFallback();
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
  if (product.oldPrice && product.price && product.oldPrice > product.price) {
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
  const hasOldPrice = product.oldPrice && product.price && product.oldPrice > product.price;
  const curPriceY = hasOldPrice ? priceY + 58 : priceY;
  ctx.fillStyle = BRAND.gold;
  ctx.font = "bold 72px sans-serif";
  if (product.price) {
    ctx.fillText(`₹${product.price.toLocaleString("en-IN")}`, W / 2, curPriceY);
  } else {
    ctx.fillText("Best Deal!", W / 2, curPriceY);
  }

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
function parsePrice(val) {
  if (!val) return 0;
  const clean = val.toString().replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

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
async function postToPinterest({ boardId, imageUrl, title, description, linkUrl, category }) {
  const body = {
    board_id:   boardId,
    media_source: { source_type: "image_url", url: imageUrl },
    title:       title.substring(0, 100),
    description: description.substring(0, 500),
    link:        linkUrl,
  };

  const makeRequest = async (baseUrl, payload) => {
    const res = await fetch(`${baseUrl}/v5/pins`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PINTEREST_TOKEN}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      throw { status: res.status, data: json };
    }
    return json;
  };

  const getOrCreateSandboxBoard = async (categoryName) => {
    const boardName = `SmartPicks ${categoryName.toUpperCase()}`;
    console.log("     Checking existing sandbox boards...");
    try {
      const listRes = await fetch("https://api-sandbox.pinterest.com/v5/boards", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${PINTEREST_TOKEN}`,
        }
      });
      const listJson = await listRes.json();
      if (listRes.ok && listJson.items) {
        const existing = listJson.items.find(b => b.name.toLowerCase() === boardName.toLowerCase());
        if (existing) {
          console.log(`     Found existing sandbox board "${boardName}" with ID: ${existing.id}`);
          return existing.id;
        }
      }
    } catch (e) {
      console.warn("     ⚠️ Failed to query sandbox boards list:", e.message);
    }

    console.log(`     Creating sandbox board "${boardName}"...`);
    const createRes = await fetch("https://api-sandbox.pinterest.com/v5/boards", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PINTEREST_TOKEN}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        name: boardName,
        description: `Deals for ${boardName} from SmartPicks India`,
      }),
    });
    const createJson = await createRes.json();
    if (!createRes.ok) {
      throw new Error(`Failed to create sandbox board: ${JSON.stringify(createJson)}`);
    }
    return createJson.id;
  };

  try {
    return await makeRequest("https://api.pinterest.com", body);
  } catch (err) {
    // Retry using the API Sandbox if the production API call fails with 403 (Trial limit) or 401 (e.g. when using a Sandbox token)
    const shouldRetrySandbox = err.status === 403 || err.status === 401;
    if (shouldRetrySandbox) {
      console.warn(`   ⚠️ Production API failed (Status ${err.status}). Retrying post using Pinterest API Sandbox...`);
      try {
        return await makeRequest("https://api-sandbox.pinterest.com", body);
      } catch (sandboxErr) {
        // If sandbox board doesn't exist, try to get or create a sandbox board
        const isBoardErr = sandboxErr.status === 404 || 
                           sandboxErr.status === 400 || 
                           JSON.stringify(sandboxErr.data).toLowerCase().includes("board");
        if (isBoardErr) {
          console.warn("   ⚠️ Sandbox board not found. Attempting to auto-create sandbox board...");
          try {
            const sandboxBoardId = await getOrCreateSandboxBoard(category || "Deals");
            console.log(`   ✅ Using Sandbox Board ID: ${sandboxBoardId}`);
            const newBody = { ...body, board_id: sandboxBoardId };
            return await makeRequest("https://api-sandbox.pinterest.com", newBody);
          } catch (createErr) {
            throw new Error(`Sandbox board fallback failed: ${createErr.message}`);
          }
        }
        throw new Error(`Sandbox post failed: ${JSON.stringify(sandboxErr.data)}`);
      }
    }
    throw new Error(`Pinterest API error ${err.status}: ${JSON.stringify(err.data)}`);
  }
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

  // Load pinterest-captions.md to resolve product page URLs
  const captionsMap = loadCaptionsMap();
  console.log(`Loaded ${Object.keys(captionsMap).length} entries from pinterest-captions.md`);

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
    const priceRaw     = parsePrice(record["Price"]);
    const oldPriceRaw  = parsePrice(record["Old Price"]);

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

      // 4. Build product page link
      //    First try to match in pinterest-captions.md for the real product page URL
      //    Falls back to the Amazon affiliate link if no match found
      const captionEntry = findCaptionEntry(captionsMap, productName);
      const productPageUrl = captionEntry?.url || affiliateLink;
      if (captionEntry?.url) {
        console.log(`   🔗 Matched site URL: ${captionEntry.url}`);
      } else {
        console.log(`   🔗 No site URL found — linking to Amazon affiliate link`);
      }

      // 5. Post to Pinterest
      console.log("   📌 Posting to Pinterest...");
      const pin = await postToPinterest({
        boardId,
        imageUrl:    hostedImageUrl,
        title:       pinContent.title,
        description: pinContent.description,
        linkUrl:     productPageUrl,
        category:    category,
      });
      console.log(`   🎉 Pin created! ID: ${pin.id}`);

      // 6. Mark as posted
      postedSlugs.add(affiliateLink.trim());
      pinCount++;

      // Wait 10 seconds between pins to avoid rate limits
      if (pinCount < PINS_PER_RUN) {
        console.log("   ⏳ Sleeping 10 seconds before processing the next product...");
        await sleep(10000);
      }

    } catch (err) {
      console.error(`   ❌ Failed for "${productName}":`, err.message);
      // Wait 5 seconds after failure before trying the next product
      await sleep(5000);
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

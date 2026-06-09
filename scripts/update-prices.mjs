/**
 * SmartPicks India — Automated Price Updater
 * -------------------------------------------
 * Reads your Google Sheet CSV → finds matching products in data/products.ts
 * by affiliate link → updates price & oldPrice if they differ.
 *
 * Runs daily via GitHub Actions so your website prices stay in sync
 * whenever you update the Google Sheet.
 *
 * HOW TO USE:
 *  1. Add/update "Price" and "Old Price" columns in your Google Sheet
 *  2. This script runs automatically every day at 10:00 AM IST
 *  3. If prices changed, it commits the update → Vercel auto-redeploys
 */

import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SHEET_CSV_URL = process.env.SHEET_CSV_URL;
const PRODUCTS_FILE = path.join(process.cwd(), "data", "products.ts");

if (!SHEET_CSV_URL) {
  console.error("❌ Missing SHEET_CSV_URL environment variable.");
  process.exit(1);
}

async function run() {
  console.log("📋 Fetching Google Sheet CSV...");
  const res = await fetch(SHEET_CSV_URL);
  if (!res.ok) {
    console.error(`❌ Failed to fetch sheet: HTTP ${res.status}`);
    process.exit(1);
  }

  const csvText = await res.text();
  const records = parse(csvText, { columns: true, skip_empty_lines: true });
  console.log(`   Found ${records.length} rows in sheet.\n`);

  // Build a map: affiliateLink → { price, oldPrice }
  const sheetPrices = new Map();
  for (const row of records) {
    const link     = (row["Amazon URL"] || "").trim();
    const price    = parseFloat(row["Price"] || row["price"] || "");
    const oldPrice = parseFloat(row["Old Price"] || row["old price"] || row["oldPrice"] || row["Old price"] || "");

    if (link && !isNaN(price) && price > 0) {
      sheetPrices.set(link, {
        price,
        oldPrice: (!isNaN(oldPrice) && oldPrice > price) ? oldPrice : price,
      });
    }
  }

  if (sheetPrices.size === 0) {
    console.log("⚠️  No rows with a valid 'Price' column found in the sheet.");
    console.log("   Add a 'Price' column to your Google Sheet to enable auto price updates.");
    process.exit(0);
  }

  console.log(`💰 Found ${sheetPrices.size} product(s) with prices in sheet.\n`);

  // Read current products.ts
  let content = fs.readFileSync(PRODUCTS_FILE, "utf8");
  let updatedCount = 0;

  for (const [link, { price, oldPrice }] of sheetPrices) {
    // Find the product block containing this affiliate link
    // We look for the affiliateLink line, then find the price and oldPrice lines nearby

    const linkPattern = link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex
    const regex = new RegExp(
      `(affiliateLink:\\s*"${linkPattern}"[^}]*?price:\\s*)(\\d+)([^}]*?oldPrice:\\s*)(\\d+)`,
      "s"
    );

    // Since affiliateLink comes AFTER price/oldPrice in the object, we need a different strategy
    // Split the file into product blocks and update each one
    const blockRegex = new RegExp(
      `(\\{[^}]*?affiliateLink:\\s*"${linkPattern}"[^}]*?\\})`,
      "s"
    );

    const blockMatch = content.match(blockRegex);
    if (!blockMatch) {
      // Try to find by partial match for shortened amzn.to links
      console.log(`⚠️  No match found in products.ts for: ${link}`);
      continue;
    }

    const originalBlock = blockMatch[1];

    // Extract current prices from the block
    const priceMatch    = originalBlock.match(/price:\s*(\d+)/);
    const oldPriceMatch = originalBlock.match(/oldPrice:\s*(\d+)/);

    const currentPrice    = priceMatch    ? parseInt(priceMatch[1])    : null;
    const currentOldPrice = oldPriceMatch ? parseInt(oldPriceMatch[1]) : null;

    if (currentPrice === price && currentOldPrice === oldPrice) {
      console.log(`✅ No change needed: ${link.substring(0, 50)} (₹${price})`);
      continue;
    }

    // Update the block with new prices
    let updatedBlock = originalBlock
      .replace(/price:\s*\d+/, `price: ${price}`)
      .replace(/oldPrice:\s*\d+/, `oldPrice: ${oldPrice}`);

    content = content.replace(originalBlock, updatedBlock);
    updatedCount++;

    const productName = (originalBlock.match(/title:\s*"([^"]{0,40})/) || [])[1] || link;
    console.log(`🔄 Updated: ${productName}...`);
    console.log(`   Price: ₹${currentPrice} → ₹${price}  |  MRP: ₹${currentOldPrice} → ₹${oldPrice}`);
  }

  if (updatedCount > 0) {
    fs.writeFileSync(PRODUCTS_FILE, content, "utf8");
    console.log(`\n🎉 ${updatedCount} product price(s) updated in data/products.ts`);
    console.log("   Vercel will auto-redeploy with the new prices.");
  } else {
    console.log("\n✨ All prices are already up to date — no changes needed.");
  }
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

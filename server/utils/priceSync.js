import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PriceHistory from "../models/PriceHistory.js";
import PriceAlert from "../models/PriceAlert.js";
import User from "../models/User.js";
import { sendEmail } from "./email.js"; // Standard email utility
import { sendTelegramMessage } from "./telegram.js"; // We will build this next

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCTS_FILE_PATH = path.join(__dirname, "..", "..", "data", "products.ts");

// Regex parser to read TypeScript products file without requiring TS transpiler
export function parseProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
      console.warn("⚠️ products.ts file not found at:", PRODUCTS_FILE_PATH);
      return [];
    }
    const content = fs.readFileSync(PRODUCTS_FILE_PATH, "utf8");
    const entries = content.match(/\{[\s\S]*?\}/g) || [];
    const products = [];

    for (const entry of entries) {
      const slugMatch = entry.match(/slug:\s*["']([^"']+)["']/);
      const priceMatch = entry.match(/price:\s*(\d+)/);
      const titleMatch = entry.match(/title:\s*["']([^"']+)["']/);

      if (slugMatch && priceMatch) {
        products.push({
          slug: slugMatch[1],
          price: parseInt(priceMatch[1], 10),
          title: titleMatch ? titleMatch[1] : slugMatch[1],
        });
      }
    }
    return products;
  } catch (err) {
    console.error("❌ Error parsing products.ts:", err.message);
    return [];
  }
}

// Regex parser to extract full product metadata for chatbot & admin dashboard
export function parseFullProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
      console.warn("⚠️ products.ts file not found at:", PRODUCTS_FILE_PATH);
      return [];
    }
    const content = fs.readFileSync(PRODUCTS_FILE_PATH, "utf8");
    const arrayStartIndex = content.indexOf("export const products: Product[] = [");
    const arrayContent = arrayStartIndex !== -1 ? content.substring(arrayStartIndex) : content;
    const entries = arrayContent.match(/\{[\s\S]*?\}\s*(?=,|\s*\])/g) || [];
    const products = [];

    for (const entry of entries) {
      const slugMatch = entry.match(/slug:\s*["']([^"']+)["']/);
      const titleMatch = entry.match(/title:\s*["']([^"']+)["']/);
      const imageMatch = entry.match(/image:\s*["']([^"']+)["']/);
      const categoryMatch = entry.match(/category:\s*["']([^"']+)["']/);
      const descriptionMatch = entry.match(/description:\s*["']([^"']+)["']/);
      const priceMatch = entry.match(/price:\s*(\d+)/);
      const oldPriceMatch = entry.match(/oldPrice:\s*(\d+)/);
      const ratingMatch = entry.match(/rating:\s*([\d.]+)/);
      const reviewCountMatch = entry.match(/reviewCount:\s*(\d+)/);
      const affiliateLinkMatch = entry.match(/affiliateLink:\s*["']([^"']+)["']/);

      if (slugMatch) {
        products.push({
          slug: slugMatch[1],
          title: titleMatch ? titleMatch[1] : slugMatch[1],
          image: imageMatch ? imageMatch[1] : "",
          category: categoryMatch ? categoryMatch[1] : "",
          description: descriptionMatch ? descriptionMatch[1] : "",
          price: priceMatch ? parseInt(priceMatch[1], 10) : 0,
          oldPrice: oldPriceMatch ? parseInt(oldPriceMatch[1], 10) : 0,
          rating: ratingMatch ? parseFloat(ratingMatch[1]) : 0,
          reviewCount: reviewCountMatch ? parseInt(reviewCountMatch[1], 10) : 0,
          affiliateLink: affiliateLinkMatch ? affiliateLinkMatch[1] : "",
        });
      }
    }
    return products;
  } catch (err) {
    console.error("❌ Error parsing full products.ts:", err.message);
    return [];
  }
}

// Core sync runner
export async function syncProductPrices() {
  console.log("🔄 Starting Price Synchronization...");
  const products = parseProducts();
  console.log(`   Found ${products.length} products to check.`);

  let updatedCount = 0;

  for (const product of products) {
    try {
      // Find the latest price history record for this product
      const latestHistory = await PriceHistory.findOne({ slug: product.slug }).sort({ date: -1 });

      const priceChanged = !latestHistory || latestHistory.price !== product.price;

      if (priceChanged) {
        // Record new history entry
        const historyRecord = new PriceHistory({
          slug: product.slug,
          price: product.price,
          date: new Date(),
        });
        await historyRecord.save();
        updatedCount++;

        console.log(`   📈 Price change logged for "${product.title}": ₹${product.price} (previous: ₹${latestHistory ? latestHistory.price : "none"})`);

        // If price dropped, check for alert triggers
        if (latestHistory && product.price < latestHistory.price) {
          await checkAndTriggerAlerts(product, latestHistory.price);
          await postDealToChannel(product, latestHistory.price);
        }
      }
    } catch (err) {
      console.error(`   ❌ Failed to sync price for ${product.slug}:`, err.message);
    }
  }

  console.log(`🎉 Price Sync Complete. Logged ${updatedCount} price history update(s).`);
  return { success: true, updatedCount };
}

// Scan and trigger notifications for active user alerts
async function checkAndTriggerAlerts(product, oldPrice) {
  try {
    // Find active alerts where targetPrice >= current product price
    const alerts = await PriceAlert.find({
      slug: product.slug,
      isActive: true,
      targetPrice: { $gte: product.price },
    }).populate("userId");

    if (alerts.length === 0) return;

    console.log(`   🔔 Triggering ${alerts.length} alert(s) for "${product.title}"`);

    for (const alert of alerts) {
      const user = alert.userId;
      if (!user) continue;

      const title = `Price Drop Alert: ${product.title}`;
      const message = `Good news! The price of "${product.title}" has dropped from ₹${oldPrice} to ₹${product.price}.\n\nView deal on SmartPicks India: https://smart-picks-india.vercel.app/product/${product.slug}`;

      if (alert.deliveryMethod === "email") {
        // Send email notification
        try {
          await sendEmail({
            to: user.email,
            subject: title,
            html: `
              <h2>Price Drop Alert!</h2>
              <p>Hi ${user.name},</p>
              <p>Good news! A product on your watchlist has dropped in price.</p>
              <table style="border: 1px solid #eee; padding: 15px; width: 100%;">
                <tr>
                  <td><strong>Product:</strong></td>
                  <td>${product.title}</td>
                </tr>
                  <td><strong>Old Price:</strong></td>
                  <td><del>₹${oldPrice}</del></td>
                </tr>
                <tr>
                  <td><strong>New Price:</strong></td>
                  <td style="color: #10b981; font-weight: bold;">₹${product.price}</td>
                </tr>
              </table>
              <p><a href="https://smart-picks-india.vercel.app/product/${product.slug}" style="background-color: #df3838; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Claim Deal Now</a></p>
            `,
          });
          console.log(`      ✉️ Sent price alert email to ${user.email}`);
        } catch (mailErr) {
          console.error(`      ❌ Failed to send email alert:`, mailErr.message);
        }
      } else if (alert.deliveryMethod === "telegram" && user.telegramChatId) {
        // Send Telegram alert
        try {
          const tgText = `🔔 *Price Drop Alert!*\n\nThe price of *${product.title}* has dropped from ~₹${oldPrice}~ to *₹${product.price}*!\n\n🔗 [Claim Deal Now](https://smart-picks-india.vercel.app/product/${product.slug})`;
          await sendTelegramMessage(user.telegramChatId, tgText);
          console.log(`      📱 Sent Telegram alert message to chat ${user.telegramChatId}`);
        } catch (tgErr) {
          console.error(`      ❌ Failed to send Telegram alert:`, tgErr.message);
        }
      }

      // Deactivate the alert so we don't spam the user (they can turn it back on)
      alert.isActive = false;
      await alert.save();
    }
  } catch (err) {
    console.error("❌ Error triggering alerts:", err.message);
  }
}

// Post a premium deal drop to the public channel
async function postDealToChannel(product, oldPrice) {
  try {
    const discount = Math.round(((oldPrice - product.price) / oldPrice) * 100);
    const tgText = `🔥 *LIVE DEAL DROP!* 🔥\n\n*${product.title}*\n\n📈 *Price dropped* from ~₹${oldPrice}~ to *₹${product.price}* (${discount}% OFF!)\n\n🔗 [Buy Now on Amazon](${product.affiliateLink || "https://www.amazon.in"})\n\n👉 Join @smartpicks_deals_deal for more instant budget deal drops!`;
    
    await sendTelegramMessage(null, tgText);
    console.log(`      📢 Posted deal drop for "${product.title}" to public Telegram channel`);
  } catch (err) {
    console.error(`      ❌ Failed to post deal drop to channel:`, err.message);
  }
}

// Broadcasts the top 3 biggest discount deals from catalog to the public Telegram channel
export async function broadcastTopDeals() {
  const products = parseFullProducts();
  const deals = products
    .filter(p => p.oldPrice > p.price)
    .map(p => ({ ...p, discount: Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) }))
    .sort((a, b) => b.discount - a.discount)
    .slice(0, 3);

  if (deals.length === 0) {
    return { success: false, message: "No discounted products found in catalog." };
  }

  let text = `🔥 *TODAY'S HOTTEST BUDGET PICKS!* 🔥\n\nHere are the top discounts currently active on SmartPicks India:\n\n`;
  deals.forEach((d, idx) => {
    text += `${idx + 1}️⃣ *${d.title}*\n💥 *Deal Price:* *₹${d.price}* (~₹${d.oldPrice}~)\n🏷️ *Discount:* *${d.discount}% OFF*\n🔗 [Claim Deal Now](https://smart-picks-india.vercel.app/product/${d.slug})\n\n`;
  });
  text += `👉 Join @smartpicks_deals_deal for more daily smart recommendations!`;

  await sendTelegramMessage(null, text);
  return { success: true, count: deals.length };
}

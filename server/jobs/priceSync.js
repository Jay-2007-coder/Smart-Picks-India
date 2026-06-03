import PriceHistory from "../models/PriceHistory.js";
import { parseProducts } from "../utils/priceSync.js";

// Generates retro-active price history for the last 90 days if none exists
export async function seedPriceHistoryIfEmpty() {
  console.log("📈 Checking if Price History needs initialization...");
  const products = parseProducts();

  for (const product of products) {
    try {
      const count = await PriceHistory.countDocuments({ slug: product.slug });
      if (count === 0) {
        console.log(`   🌱 Initializing 90-day price history for "${product.title}"`);
        const now = new Date();
        const records = [];

        // Generate a random walk back in time
        let currentPrice = product.price;

        for (let i = 90; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          
          // Random fluctuation between -4% and +4%
          const fluctuation = (Math.random() * 0.08 - 0.04);
          // Keep it close to base price but let it wander a bit
          currentPrice = Math.round(product.price * (1 + fluctuation));
          
          // Ensure it's a realistic positive price
          if (currentPrice < 100) currentPrice = 100;

          records.push({
            slug: product.slug,
            price: currentPrice,
            date: date,
          });
        }

        await PriceHistory.insertMany(records);
      }
    } catch (err) {
      console.error(`   ❌ Failed to initialize price history for ${product.slug}:`, err.message);
    }
  }
  console.log("📈 Price History check/seeding complete.");
}

// Generate today's price log entry with a minor variation and purge > 90 days old records
export async function runDailyPriceLog() {
  console.log("🔄 Running daily price variation logger...");
  const products = parseProducts();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const product of products) {
    try {
      // Fluctuate today's price by ±3%
      const fluctuation = (Math.random() * 0.06 - 0.03);
      const variedPrice = Math.round(product.price * (1 + fluctuation));

      // Update or create today's entry
      await PriceHistory.findOneAndUpdate(
        {
          slug: product.slug,
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
        {
          slug: product.slug,
          price: variedPrice,
          date: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`   ❌ Daily price logging failed for ${product.slug}:`, err.message);
    }
  }

  // Purge history older than 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  try {
    const purgeResult = await PriceHistory.deleteMany({ date: { $lt: ninetyDaysAgo } });
    console.log(`   🧹 Purged ${purgeResult.deletedCount} price records older than 90 days.`);
  } catch (err) {
    console.error("   ❌ Failed to purge old price records:", err.message);
  }
}

// Initialize the daily cron intervals
export function initPriceSyncCron() {
  // Run seeder first
  seedPriceHistoryIfEmpty().catch((err) => {
    console.error("❌ Failed to seed price history:", err.message);
  });

  // Schedule the sync task to run every 24 hours
  const INTERVAL_24H = 24 * 60 * 60 * 1000;
  setInterval(() => {
    console.log("⏰ 24h Cron Triggered: Price logging sync running...");
    runDailyPriceLog().catch((err) => {
      console.error("❌ Price logging cron run failed:", err.message);
    });
  }, INTERVAL_24H);

  console.log("⏰ Scheduled 24h price sync daemon successfully.");
}

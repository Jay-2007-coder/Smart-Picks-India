import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Read variables manually from .env.local without requiring external packages
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, ".env.local");

let token = "";
let channelId = "";

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("TELEGRAM_BOT_TOKEN=")) {
      token = trimmed.split("=")[1]?.trim() || "";
    }
    if (trimmed.startsWith("TELEGRAM_CHANNEL_ID=")) {
      channelId = trimmed.split("=")[1]?.trim() || "";
    }
  }
}

console.log("=================== Testing Telegram Bot ===================");
console.log("Bot Token :", token ? "✅ Loaded" : "❌ Missing");
console.log("Channel ID:", channelId || "❌ Missing");

if (!token || !channelId) {
  console.error("\n❌ Error: Please check your .env.local file. Both TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID must be filled.");
  process.exit(1);
}

async function sendTestMessage() {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const text = `🎉 *Congratulations!*\n\nYour SmartPicks India Deals Bot is officially connected to the channel!\n\n🔗 Channel ID: \`${channelId}\`\n🤖 Bot Username: @SmartPicksDealsBot`;

  console.log("\nSending test message to channel...");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: channelId,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      console.log("\n✅ Success! Check your Telegram channel. You should see the test message.");
    } else {
      console.error("\n❌ Telegram API Error:", data.description || "Unknown error");
      console.log("Make sure: \n1. The bot is added to your channel as an Administrator.\n2. The channel ID is correct (including the '@' symbol).");
    }
  } catch (err) {
    console.error("\n❌ Network Error:", err.message);
  }
}

sendTestMessage();

import dotenv from "dotenv";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";

/**
 * Sends a message via the Telegram Bot API
 * @param {string|number} chatId - The target chat ID or channel username
 * @param {string} text - The markdown message text
 * @returns {Promise<object>} response from telegram api or mock status
 */
export async function sendTelegramMessage(chatId, text) {
  const targetId = chatId || TELEGRAM_CHANNEL_ID;

  if (!TELEGRAM_BOT_TOKEN) {
    console.log("\n=================== MOCK TELEGRAM SENT ===================");
    console.log(`To Chat/Channel: ${targetId}`);
    console.log("------------------ Content ------------------");
    console.log(text);
    console.log("==========================================================\n");
    return { mock: true, success: true };
  }

  if (!targetId) {
    console.warn("⚠️ Telegram send aborted: No chat ID or channel ID provided.");
    return { success: false, error: "Missing chat or channel ID" };
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: targetId,
        text: text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.description || `HTTP status ${response.status}`);
    }

    return { success: true, data };
  } catch (err) {
    console.error(`❌ Failed to send Telegram message to ${targetId}:`, err.message);
    throw err;
  }
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID || "";

/**
 * Escapes special HTML characters to prevent malformed messages.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Sends a message via the Telegram Bot API using HTML parse mode.
 * HTML mode is more reliable than Markdown because it never breaks
 * on special characters in product titles (parentheses, asterisks, etc.)
 *
 * HTML tags supported: <b>, <i>, <s>, <u>, <a href="...">, <code>, <pre>
 *
 * @param {string|number} chatId - The target chat ID or channel username (null for default channel)
 * @param {string} html - The HTML-formatted message text
 * @returns {Promise<object>} response from telegram api or mock status
 */
export async function sendTelegramMessage(chatId, html) {
  const targetId = chatId || TELEGRAM_CHANNEL_ID;

  if (!TELEGRAM_BOT_TOKEN) {
    console.log("\n=================== MOCK TELEGRAM SENT ===================");
    console.log(`To Chat/Channel: ${targetId}`);
    console.log("------------------ Content ------------------");
    console.log(html);
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
        text: html,
        parse_mode: "HTML",
        disable_web_page_preview: false,
        disable_notification: false,
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

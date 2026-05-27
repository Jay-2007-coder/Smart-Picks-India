import twilio from "twilio";

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

let client;

if (ACCOUNT_SID && AUTH_TOKEN) {
  try {
    client = twilio(ACCOUNT_SID, AUTH_TOKEN);
  } catch (err) {
    console.error("Failed to initialize Twilio client:", err.message);
  }
}

export async function sendSms(to, message) {
  if (!client || !PHONE_NUMBER) {
    console.log("\n==================== MOCK SMS SENT ====================");
    console.log(`To:      ${to}`);
    console.log(`Message: ${message}`);
    console.log("========================================================\n");
    return { mock: true, sid: "mock-sms-sid-" + Math.random() };
  }

  return await client.messages.create({
    body: message,
    from: PHONE_NUMBER,
    to,
  });
}

export async function sendOtpSms(phone, otpCode) {
  const message = `SmartPicks India: Your OTP for authentication is ${otpCode}. It is valid for 5 minutes. Do not share this code.`;
  return await sendSms(phone, message);
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function readEnv() {
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local file not found");
  }
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      env[match[1]] = match[2] ? match[2].trim() : "";
    }
  });
  return env;
}

async function run() {
  try {
    const env = readEnv();
    const appId = env.PINTEREST_APP_ID;
    const appSecret = env.PINTEREST_APP_SECRET;

    if (!appId || !appSecret) {
      console.log("STATUS: MISSING_CREDS");
      console.log("Please add PINTEREST_APP_ID and PINTEREST_APP_SECRET to your .env.local file first.");
      return;
    }

    const redirectUri = "http://localhost:3000";
    const scopes = "boards:read,boards:write,pins:read,pins:write";
    const authUrl = `https://www.pinterest.com/oauth/?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=smartpicks`;

    console.log("STATUS: URL_GENERATED");
    console.log("AUTH_URL:", authUrl);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

run();

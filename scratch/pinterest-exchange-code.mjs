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

function updateEnv(key, value) {
  let content = fs.readFileSync(envPath, "utf8");
  const regex = new RegExp(`^\\s*${key}\\s*=.*$`, "m");
  if (regex.test(content)) {
    content = content.replace(regex, `${key}=${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, content, "utf8");
}

async function run() {
  const codeArg = process.argv[2];
  if (!codeArg) {
    console.error("ERROR: No code provided. Usage: node scripts/exchange.mjs <code>");
    return;
  }

  let code = codeArg.trim();
  try {
    if (code.includes("code=")) {
      const url = new URL(code);
      code = url.searchParams.get("code") || code;
    }
  } catch {
    // Ignore URL parsing errors and treat it as a raw code
  }

  try {
    const env = readEnv();
    const appId = env.PINTEREST_APP_ID;
    const appSecret = env.PINTEREST_APP_SECRET;

    if (!appId || !appSecret) {
      console.error("ERROR: Missing PINTEREST_APP_ID or PINTEREST_APP_SECRET in .env.local");
      return;
    }

    const redirectUri = "http://localhost:3000";
    const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");
    
    console.log("Exchanging code for access token...");
    const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }).toString()
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(JSON.stringify(json));
    }

    const token = json.access_token;
    if (!token) {
      throw new Error("No access_token found in response");
    }

    console.log("SUCCESS_TOKEN:", token);
    updateEnv("PINTEREST_TOKEN", token);
    console.log("Successfully updated PINTEREST_TOKEN in .env.local!");

  } catch (err) {
    console.error("ERROR:", err.message);
  }
}

run();

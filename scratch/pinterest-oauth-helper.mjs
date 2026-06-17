import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function run() {
  console.log("=== Pinterest API OAuth Token Generator ===");
  console.log("This script helps you generate a Pinterest token with the required 'write' scopes.");
  console.log("Refer to the Pinterest developer portal for your App ID and App Secret.\n");

  const appId = (await question("Enter your Pinterest App ID (Client ID): ")).trim();
  const appSecret = (await question("Enter your Pinterest App Secret (Client Secret): ")).trim();
  const redirectUri = (await question("Enter your Redirect URI (must match exactly what you added in Pinterest settings, e.g. http://localhost:3000): ")).trim();

  if (!appId || !appSecret || !redirectUri) {
    console.error("❌ Missing required fields!");
    rl.close();
    return;
  }

  // Construct Auth URL
  const scopes = "boards:read,boards:write,pins:read,pins:write";
  const authUrl = `https://www.pinterest.com/oauth/?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=smartpicks`;

  console.log("\n1. Copy and open this URL in your web browser:\n");
  console.log(`🔗 ${authUrl}\n`);
  console.log("2. Log in, click 'Authorize'.");
  console.log("3. Your browser will redirect to a page (which might show an error, e.g., 'This site can’t be reached').");
  console.log("4. Copy the entire URL of that page from the address bar.\n");

  const redirectUrl = (await question("Paste the redirected URL (or the 'code' parameter value): ")).trim();
  rl.close();

  let code = "";
  try {
    if (redirectUrl.includes("code=")) {
      const urlParams = new URL(redirectUrl);
      code = urlParams.searchParams.get("code");
    } else {
      code = redirectUrl;
    }
  } catch {
    code = redirectUrl;
  }

  if (!code) {
    console.error("❌ Could not extract authorization code!");
    return;
  }

  console.log(`\n🔑 Extracted Code: ${code}`);
  console.log("Exchanging code for Pinterest access token...");

  try {
    const credentials = Buffer.from(`${appId}:${appSecret}`).toString("base64");
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

    console.log("\n🎉 SUCCESS! Generated Access Token:");
    console.log("----------------------------------------");
    console.log(json.access_token);
    console.log("----------------------------------------");
    console.log(`\nScopes granted: ${json.scope}`);
    console.log("Expires in:", json.expires_in, "seconds");
    if (json.refresh_token) {
      console.log("Refresh token:", json.refresh_token);
    }
    console.log("\n👉 Copy the Access Token and save it in your GitHub Secrets as PINTEREST_TOKEN.");
  } catch (err) {
    console.error("\n❌ Token exchange failed:", err.message);
  }
}

run();

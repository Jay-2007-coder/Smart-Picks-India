import fs from "fs";
import path from "path";

// Manually parse env file
const envPath = path.resolve(".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
let pinterestToken = "";

for (const line of envContent.split("\n")) {
  if (line.startsWith("PINTEREST_TOKEN=")) {
    pinterestToken = line.substring("PINTEREST_TOKEN=".length).trim();
  }
}

async function listBoards() {
  if (!pinterestToken) {
    console.error("Error: PINTEREST_TOKEN not found in .env.local");
    return;
  }

  console.log("Calling Pinterest API to list boards...");
  try {
    const response = await fetch("https://api.pinterest.com/v5/boards", {
      headers: {
        Authorization: `Bearer ${pinterestToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("API Error:", data);
      return;
    }

    console.log("\nSuccess! Boards found:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Network Error:", error);
  }
}

listBoards();

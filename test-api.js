const API_KEY = process.argv[2];

if (!API_KEY) {
  console.log("Please provide your API key like this: node test-api.js YOUR_KEY_HERE");
  process.exit(1);
}

async function testKey() {
  console.log("Testing API Key...");
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await res.json();
    
    if (data.error) {
      console.log("❌ API Key Error:", data.error.message);
    } else if (data.models) {
      console.log(`✅ Success! Your API key has access to ${data.models.length} models.`);
      const flashModel = data.models.find(m => m.name === "models/gemini-1.5-flash");
      if (flashModel) {
        console.log("✅ gemini-1.5-flash is available!");
      } else {
        console.log("❌ gemini-1.5-flash is NOT available on this key.");
      }
    } else {
      console.log("Unknown response:", data);
    }
  } catch (err) {
    console.log("❌ Network Error:", err.message);
  }
}

testKey();

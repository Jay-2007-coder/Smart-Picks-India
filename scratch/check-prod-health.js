async function checkHealth() {
  const url = "https://smart-picks-india.onrender.com/health";
  console.log("Checking health of:", url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error checking health:", err.message);
  }
}

checkHealth();

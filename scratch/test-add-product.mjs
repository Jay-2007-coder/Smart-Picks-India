async function run() {
  const url = "http://localhost:5000/api/v1/admin/add-product";
  console.log(`Sending POST request to local endpoint: ${url}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    console.log("Response Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}
run();

import { parse } from "csv-parse/sync";

async function testFetch() {
  const url = "https://docs.google.com/spreadsheets/d/1zC7qU-cCVai6cxC2NQEjETFIQnp5WcjcsekkCWICXrI/export?format=csv";
  console.log("Fetching Google Sheet CSV...");
  const res = await fetch(url);
  const text = await res.text();
  const records = parse(text, { columns: true, skip_empty_lines: true });
  console.log(`Parsed ${records.length} records:`);
  records.forEach((r, index) => {
    console.log(`${index + 1}: Name: "${r["Product Name"]}" | URL: "${r["Amazon URL"]}" | Category: "${r["Category"]}" | Image: "${r["Image URL"]}"`);
  });
}

testFetch().catch(console.error);

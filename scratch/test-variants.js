const variations1 = ['l', 'I', '1']; // for SQ_g6j
const variations2 = ['O', '0']; // for E_LubufjAY or E_lubufjAY
const variations3 = ['L', 'l', 'I', '1']; // for EO_ubufjAY

async function test() {
  for (const v1 of variations1) {
    for (const v2 of variations2) {
      for (const v3 of variations3) {
        // Construct the key with these variations
        const key = `2PACX-1vSY_ZkDUwSQ${v1}g6jZNooQW52ykE5stAAbmWTvQrNvEz-Kwx4yD-8nQjJZcSkMC3VXiBi5kE${v2}${v3}ubufjAY`;
        const url = `https://docs.google.com/spreadsheets/d/e/${key}/pub?gid=0&single=true&output=csv`;
        
        try {
          const res = await fetch(url);
          const text = await res.text();
          if (res.ok && !text.includes('Page not found') && !text.includes('<!DOCTYPE html>')) {
            console.log(`\n🎉 SUCCESS! URL is valid:`);
            console.log(url);
            console.log(`\nFirst 200 chars of content:`);
            console.log(text.substring(0, 200));
            return;
          } else {
            process.stdout.write('.');
          }
        } catch (e) {
          process.stdout.write('x');
        }
      }
    }
  }
  console.log('\n❌ None of the variations succeeded.');
}

test().catch(console.error);

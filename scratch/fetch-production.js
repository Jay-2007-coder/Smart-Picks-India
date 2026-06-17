async function run() {
  const url = 'https://smart-picks-india.onrender.com/health';
  console.log('Fetching health from', url);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('Health Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error fetching:', err);
  }
}
run();

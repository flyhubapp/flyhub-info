async function check() {
  const endpoints = [
    'http://localhost:5000/api/health',
    'http://localhost:5000/api/leads',
    'http://localhost:5000/api/contact',
    'http://localhost:5000/api/franchise',
    'http://localhost:5000/api/app-access',
    'http://localhost:5000/api/registration'
  ];

  console.log('--- Connectivity Audit (Node Fetch) ---');
  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`✅ ${url}: ${res.status} (${Array.isArray(data) ? data.length + ' records' : (data.status || 'JSON')})`);
    } catch (err) {
      console.error(`❌ ${url}: ${err.message}`);
    }
  }
}

check();

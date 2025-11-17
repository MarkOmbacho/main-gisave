const https = require('https');
const http = require('http');

// Configuration
const RENDER_URL = 'https://main-gisave.onrender.com';
const VERCEL_URL = 'https://main-gisave.vercel.app';

console.log('🔍 Testing Backend-Frontend Connection...\n');

function testEndpoint(url, name) {
  return new Promise((resolve) => {
    console.log(`Testing ${name}: ${url}`);
    
    const startTime = Date.now();
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, { timeout: 10000 }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`✅ ${name}: ${res.statusCode} (${responseTime}ms)`);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(parsed).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        }
        console.log('');
        resolve({ success: res.statusCode < 400, status: res.statusCode, time: responseTime });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name}: Error - ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ${name}: Timeout after 10 seconds\n`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.setTimeout(10000);
  });
}

async function runTests() {
  const tests = [
    { url: `${RENDER_URL}/health`, name: 'Backend Health' },
    { url: `${RENDER_URL}/api/auth/check`, name: 'Auth API' },
    { url: `${RENDER_URL}/api/blogs`, name: 'Blogs API' },
    { url: `${RENDER_URL}/api/mentors`, name: 'Mentors API' },
    { url: `${VERCEL_URL}`, name: 'Frontend Home' },
    { url: `https://sniypsdtsqlapdwnlvoh.supabase.co/rest/v1/`, name: 'Supabase API' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name);
    results.push(result);
  }
  
  // Summary
  console.log('📊 Summary:');
  console.log('===========');
  const passed = results.filter(r => r.success).length;
  console.log(`Passed: ${passed}/${results.length} tests`);
  
  if (passed === results.length) {
    console.log('🎉 All connections working!');
  } else {
    console.log('⚠️  Some connections failed - check logs above');
  }
}

runTests().catch(console.error);
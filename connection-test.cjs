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
        if (data && data.length < 500) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Response: ${JSON.stringify(parsed)}`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 200)}...`);
          }
        } else if (data) {
          console.log(`   Response: ${data.substring(0, 100)}... (${data.length} chars)`);
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
  console.log(`Frontend URL: ${VERCEL_URL}`);
  console.log(`Backend URL: ${RENDER_URL}`);
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  console.log('🔍 Testing Core Connectivity...\n');
  
  const tests = [
    { url: `${RENDER_URL}/`, name: 'Backend Service' },
    { url: `${VERCEL_URL}`, name: 'Frontend Service' }
  ];
  
  console.log('📝 Note: API endpoints are accessible but may require:');
  console.log('   - Database setup for data endpoints');  
  console.log('   - Authentication tokens for protected routes');
  console.log('   - Proper CORS configuration\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name);
    results.push({ ...result, name: test.name });
  }
  
  // Summary
  console.log('📊 SUMMARY:');
  console.log('============');
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const time = result.time ? `(${result.time}ms)` : '';
    console.log(`${result.name.padEnd(20)}: ${status} ${time}`);
  });
  
  const passed = results.filter(r => r.success).length;
  console.log(`\nResults: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('🎉 All connections working perfectly!');
  } else {
    console.log('⚠️  Some connections failed - check details above');
  }
  
  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  return passed === results.length;
}

runTests().catch(console.error);
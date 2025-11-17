const https = require('https');

const RENDER_URL = 'https://main-gisave.onrender.com';

console.log('🔍 GISAVE API Endpoints Test\n');

function testEndpoint(url, name, expectedStatus = 200) {
  return new Promise((resolve) => {
    console.log(`Testing ${name}: ${url}`);
    
    const startTime = Date.now();
    
    const req = https.get(url, { timeout: 15000 }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isSuccess = res.statusCode === expectedStatus || (res.statusCode >= 200 && res.statusCode < 400);
        const status = isSuccess ? '✅' : '⚠️';
        
        console.log(`${status} ${name}: ${res.statusCode} (${responseTime}ms)`);
        
        // Show response based on content type
        if (res.headers['content-type']?.includes('application/json')) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   JSON Response: ${JSON.stringify(parsed).substring(0, 150)}...`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`   Response: ${data.substring(0, 100)}...`);
        }
        
        console.log('');
        resolve({ 
          success: isSuccess, 
          status: res.statusCode, 
          time: responseTime,
          contentType: res.headers['content-type']
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${name}: Error - ${error.message}\n`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`⏰ ${name}: Timeout\n`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.setTimeout(15000);
  });
}

async function runAPITests() {
  console.log(`Backend URL: ${RENDER_URL}`);
  console.log(`Started at: ${new Date().toISOString()}\n`);
  
  const tests = [
    // Core service
    { url: `${RENDER_URL}/`, name: 'Backend Service', expectedStatus: 200 },
    
    // API endpoints (may have different response codes)
    { url: `${RENDER_URL}/blogs/`, name: 'Blogs API', expectedStatus: [200, 500] },
    { url: `${RENDER_URL}/mentors/list`, name: 'Mentors List', expectedStatus: [200, 401] },
    { url: `${RENDER_URL}/programs/`, name: 'Programs API', expectedStatus: [200, 500] },
    { url: `${RENDER_URL}/auth/check`, name: 'Auth Check', expectedStatus: [200, 401, 422] },
    
    // Try some other potential endpoints
    { url: `${RENDER_URL}/health`, name: 'Health Check', expectedStatus: [200, 404] },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testEndpoint(test.url, test.name, test.expectedStatus);
    results.push({ ...result, name: test.name });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Analysis
  console.log('📊 API ANALYSIS:');
  console.log('================');
  
  const serviceWorking = results.find(r => r.name === 'Backend Service')?.success;
  const apiResponding = results.filter(r => r.name.includes('API') && r.status).length;
  const totalAPIs = results.filter(r => r.name.includes('API')).length;
  
  console.log(`✅ Backend Service: ${serviceWorking ? 'WORKING' : 'FAILED'}`);
  console.log(`📡 API Endpoints: ${apiResponding}/${totalAPIs} responding`);
  
  if (serviceWorking) {
    console.log('\n✅ CORE CONNECTION: Backend is live and responding!');
    
    const workingAPIs = results.filter(r => r.success && r.name.includes('API'));
    const failedAPIs = results.filter(r => !r.success && r.name.includes('API'));
    
    if (workingAPIs.length > 0) {
      console.log('✅ Working APIs:', workingAPIs.map(r => r.name).join(', '));
    }
    
    if (failedAPIs.length > 0) {
      console.log('⚠️  APIs needing attention:', failedAPIs.map(r => r.name).join(', '));
      console.log('\nCommon API issues:');
      console.log('- 500 errors: Database not initialized/configured');
      console.log('- 401 errors: Authentication required');
      console.log('- 404 errors: Route not registered');
    }
  } else {
    console.log('\n❌ CORE CONNECTION: Backend service is down');
  }
  
  console.log(`\nCompleted at: ${new Date().toISOString()}`);
  return serviceWorking;
}

runAPITests().catch(console.error);
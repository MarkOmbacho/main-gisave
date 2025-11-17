const https = require('https');

// Configuration
const RENDER_URL = 'https://main-gisave.onrender.com';
const PING_INTERVAL = 5; // minutes
const ENDPOINTS_TO_PING = ['/'];

console.log('🔄 GISAVE Render Keep-Alive Service Starting...');
console.log(`Backend URL: ${RENDER_URL}`);
console.log(`Ping interval: ${PING_INTERVAL} minutes`);
console.log(`Endpoints: ${ENDPOINTS_TO_PING.join(', ')}`);
console.log('='.repeat(50));

function pingEndpoint(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = https.get(url, { timeout: 30000 }, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const timestamp = new Date().toISOString();
        const status = res.statusCode < 400 ? '✅' : '⚠️';
        console.log(`${timestamp} ${status} ${url} - ${res.statusCode} (${responseTime}ms)`);
        resolve({ success: res.statusCode < 400, status: res.statusCode, time: responseTime });
      });
    });
    
    req.on('error', (error) => {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ❌ ${url} - Error: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ⏰ ${url} - Timeout (30s)`);
      resolve({ success: false, error: 'timeout' });
    });
    
    req.setTimeout(30000);
  });
}

async function performKeepAlive() {
  console.log(`\n🔔 Keep-alive ping started at ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const endpoint of ENDPOINTS_TO_PING) {
    const url = `${RENDER_URL}${endpoint}`;
    const result = await pingEndpoint(url);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const successCount = results.filter(r => r.success).length;
  const totalTime = results.reduce((sum, r) => sum + (r.time || 0), 0);
  
  console.log(`📊 Ping summary: ${successCount}/${results.length} successful, avg time: ${Math.round(totalTime / results.length)}ms`);
  
  if (successCount === 0) {
    console.log('⚠️  All pings failed - backend might be down or cold starting');
  } else if (successCount < results.length) {
    console.log('⚠️  Some pings failed - partial connectivity issues');
  } else {
    console.log('✅ All pings successful - backend is warm and responsive');
  }
}

// Initial ping
performKeepAlive();

// Set up interval pinging
const intervalMs = PING_INTERVAL * 60 * 1000;
setInterval(performKeepAlive, intervalMs);

console.log(`\n🎯 Keep-alive service running. Press Ctrl+C to stop.`);
console.log(`Next ping in ${PING_INTERVAL} minutes...`);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Keep-alive service stopping...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Keep-alive service terminated...');
  process.exit(0);
});
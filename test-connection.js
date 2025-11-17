#!/usr/bin/env node

/**
 * Backend-Frontend Connection Test Script
 * Tests connectivity between Vercel frontend and Render backend
 */

import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const RENDER_URL = 'https://main-gisave.onrender.com';
const VERCEL_URL = 'https://main-gisave.vercel.app'; // Update with your actual Vercel URL
const SUPABASE_URL = 'https://sniypsdtsqlapdwnlvoh.supabase.co';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const module = url.startsWith('https:') ? https : http;
    const startTime = Date.now();
    
    const req = module.request(url, {
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'GISAVE-Connection-Test/1.0',
        'Accept': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            responseTime,
            raw: data
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            responseTime,
            raw: data,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        code: error.code,
        responseTime: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        code: 'TIMEOUT',
        responseTime: Date.now() - startTime
      });
    });

    req.end();
  });
}

// Test functions
async function testBackendHealth() {
  log('\n🔍 Testing Backend Health...', 'blue');
  
  try {
    const response = await makeRequest(`${RENDER_URL}/health`);
    
    if (response.status === 200 && response.data) {
      log(`✅ Backend is healthy (${response.responseTime}ms)`, 'green');
      log(`   Status: ${response.data.status}`, 'green');
      log(`   Environment: ${response.data.environment}`, 'green');
      log(`   CORS Enabled: ${response.data.cors_enabled}`, 'green');
      log(`   Database Connected: ${response.data.database_connected}`, 'green');
      return true;
    } else {
      log(`❌ Backend health check failed (Status: ${response.status})`, 'red');
      log(`   Response: ${response.raw}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend unreachable: ${error.error}`, 'red');
    log(`   Error Code: ${error.code}`, 'red');
    return false;
  }
}

async function testBackendAPI() {
  log('\n🔍 Testing Backend API Root...', 'blue');
  
  try {
    const response = await makeRequest(`${RENDER_URL}/`);
    
    if (response.status === 200) {
      log(`✅ Backend API root accessible (${response.responseTime}ms)`, 'green');
      if (response.data) {
        log(`   API Response: ${JSON.stringify(response.data, null, 2)}`, 'green');
      }
      return true;
    } else {
      log(`❌ Backend API failed (Status: ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Backend API unreachable: ${error.error}`, 'red');
    return false;
  }
}

async function testCORS() {
  log('\n🔍 Testing CORS Configuration...', 'blue');
  
  try {
    const response = await makeRequest(`${RENDER_URL}/health`, {
      headers: {
        'Origin': VERCEL_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    if (response.headers['access-control-allow-origin']) {
      log(`✅ CORS configured correctly`, 'green');
      log(`   Allowed Origin: ${response.headers['access-control-allow-origin']}`, 'green');
      return true;
    } else {
      log(`⚠️  CORS headers not found - may cause frontend issues`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ CORS test failed: ${error.error}`, 'red');
    return false;
  }
}

async function testSupabaseConnection() {
  log('\n🔍 Testing Supabase Connection...', 'blue');
  
  try {
    const response = await makeRequest(`${SUPABASE_URL}/rest/v1/`);
    
    if (response.status === 200 || response.status === 401) {
      log(`✅ Supabase is reachable (${response.responseTime}ms)`, 'green');
      return true;
    } else {
      log(`❌ Supabase unreachable (Status: ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Supabase connection failed: ${error.error}`, 'red');
    return false;
  }
}

async function testFrontendDeployment() {
  log('\n🔍 Testing Frontend Deployment...', 'blue');
  
  try {
    const response = await makeRequest(VERCEL_URL);
    
    if (response.status === 200) {
      log(`✅ Frontend is accessible (${response.responseTime}ms)`, 'green');
      return true;
    } else {
      log(`❌ Frontend unreachable (Status: ${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend connection failed: ${error.error}`, 'red');
    return false;
  }
}

async function testAPIEndpoints() {
  log('\n🔍 Testing Key API Endpoints...', 'blue');
  
  const endpoints = [
    '/api/mentors',
    '/api/blogs',
    '/api/programs'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${RENDER_URL}${endpoint}`);
      
      if (response.status === 200 || response.status === 401) {
        log(`✅ ${endpoint} - Reachable (${response.responseTime}ms)`, 'green');
        results.push(true);
      } else {
        log(`❌ ${endpoint} - Failed (Status: ${response.status})`, 'red');
        results.push(false);
      }
    } catch (error) {
      log(`❌ ${endpoint} - Error: ${error.error}`, 'red');
      results.push(false);
    }
  }
  
  return results.every(result => result);
}

// Main test runner
async function runTests() {
  log(`${colors.bold}${colors.blue}🚀 GISAVE Backend-Frontend Connection Test${colors.reset}`);
  log(`${colors.blue}=====================================================${colors.reset}`);
  log(`Frontend URL: ${VERCEL_URL}`);
  log(`Backend URL: ${RENDER_URL}`);
  log(`Supabase URL: ${SUPABASE_URL}`);
  log(`Test started at: ${new Date().toISOString()}`);
  
  const results = {
    backendHealth: await testBackendHealth(),
    backendAPI: await testBackendAPI(),
    cors: await testCORS(),
    supabase: await testSupabaseConnection(),
    frontend: await testFrontendDeployment(),
    apiEndpoints: await testAPIEndpoints()
  };
  
  // Summary
  log('\n📊 Test Summary:', 'bold');
  log('===============', 'blue');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const color = passed ? 'green' : 'red';
    log(`${test.padEnd(20)}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    log('\n🎉 All tests passed! Backend and frontend are properly connected.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the results above for issues.', 'yellow');
  }
  
  log(`\nTest completed at: ${new Date().toISOString()}`, 'blue');
  
  return allPassed;
}

// Export for use as module or run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  runTests().catch(console.error);
}

export { runTests, makeRequest };
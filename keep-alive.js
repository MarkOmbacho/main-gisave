#!/usr/bin/env node

/**
 * Render Keep-Alive Script
 * Prevents cold starts by pinging the backend periodically
 * 
 * Why this is needed:
 * - Render free tier spins down services after 15 minutes of inactivity
 * - Cold starts can take 30+ seconds, causing poor user experience
 * - Regular pings keep the service "warm" and responsive
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  BACKEND_URL: 'https://main-gisave.onrender.com',
  PING_INTERVAL: 10 * 60 * 1000, // 10 minutes (in milliseconds)
  HEALTH_ENDPOINT: '/health',
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 15000, // 15 seconds
  LOG_FILE: path.join(__dirname, 'keep-alive.log'),
  QUIET_HOURS: {
    start: 23, // 11 PM
    end: 6     // 6 AM (UTC)
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

function log(message, color = 'gray', writeToFile = true) {
  const timestamp = new Date().toISOString();
  const coloredMessage = `${colors[color]}[${timestamp}] ${message}${colors.reset}`;
  
  console.log(coloredMessage);
  
  if (writeToFile) {
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage, 'utf8');
  }
}

function isQuietHours() {
  const now = new Date();
  const hour = now.getUTCHours();
  
  if (CONFIG.QUIET_HOURS.start > CONFIG.QUIET_HOURS.end) {
    // Quiet hours span midnight (e.g., 23:00 to 06:00)
    return hour >= CONFIG.QUIET_HOURS.start || hour < CONFIG.QUIET_HOURS.end;
  } else {
    // Quiet hours within same day
    return hour >= CONFIG.QUIET_HOURS.start && hour < CONFIG.QUIET_HOURS.end;
  }
}

function pingBackend() {
  return new Promise((resolve, reject) => {
    const url = `${CONFIG.BACKEND_URL}${CONFIG.HEALTH_ENDPOINT}`;
    const startTime = Date.now();
    
    const req = https.request(url, {
      method: 'GET',
      timeout: CONFIG.REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'GISAVE-KeepAlive/1.0',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        
        if (res.statusCode === 200) {
          resolve({
            success: true,
            status: res.statusCode,
            responseTime,
            data: data.substring(0, 200) // Truncate for logging
          });
        } else {
          reject({
            success: false,
            status: res.statusCode,
            responseTime,
            error: `HTTP ${res.statusCode}`
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message,
        code: error.code,
        responseTime: Date.now() - startTime
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        success: false,
        error: 'Request timeout',
        code: 'TIMEOUT',
        responseTime: Date.now() - startTime
      });
    });

    req.end();
  });
}

async function performPing() {
  const isQuiet = isQuietHours();
  
  if (isQuiet) {
    log('Skipping ping during quiet hours', 'yellow');
    return;
  }

  log('Pinging backend...', 'blue');

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      const result = await pingBackend();
      
      if (result.success) {
        log(`✅ Ping successful (${result.responseTime}ms) - Backend is warm`, 'green');
        return;
      }
    } catch (error) {
      const retryText = attempt < CONFIG.MAX_RETRIES ? ` (attempt ${attempt}/${CONFIG.MAX_RETRIES})` : '';
      log(`❌ Ping failed: ${error.error}${retryText}`, 'red');
      
      if (attempt < CONFIG.MAX_RETRIES) {
        log(`Retrying in 30 seconds...`, 'yellow');
        await new Promise(resolve => setTimeout(resolve, 30000));
      }
    }
  }
  
  log(`⚠️  All ${CONFIG.MAX_RETRIES} ping attempts failed`, 'red');
}

function startKeepAlive() {
  log('🚀 Starting GISAVE Keep-Alive Service', 'blue');
  log(`Backend URL: ${CONFIG.BACKEND_URL}`, 'gray');
  log(`Ping interval: ${CONFIG.PING_INTERVAL / 1000 / 60} minutes`, 'gray');
  log(`Quiet hours: ${CONFIG.QUIET_HOURS.start}:00 - ${CONFIG.QUIET_HOURS.end}:00 UTC`, 'gray');
  log(`Log file: ${CONFIG.LOG_FILE}`, 'gray');
  
  // Initial ping
  performPing();
  
  // Set up interval
  const interval = setInterval(() => {
    performPing();
  }, CONFIG.PING_INTERVAL);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    log('🛑 Received SIGINT, shutting down keep-alive service...', 'yellow');
    clearInterval(interval);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    log('🛑 Received SIGTERM, shutting down keep-alive service...', 'yellow');
    clearInterval(interval);
    process.exit(0);
  });
  
  log('✅ Keep-alive service started successfully', 'green');
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`💥 Uncaught exception: ${error.message}`, 'red');
  log(`Stack: ${error.stack}`, 'red');
});

process.on('unhandledRejection', (reason, promise) => {
  log(`💥 Unhandled rejection at: ${promise}, reason: ${reason}`, 'red');
});

// Export for testing or run directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  startKeepAlive();
}

export { 
  startKeepAlive, 
  performPing, 
  pingBackend,
  CONFIG 
};
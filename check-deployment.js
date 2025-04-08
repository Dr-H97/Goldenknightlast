/**
 * Deployment Check Script
 * 
 * This script validates that your application is correctly configured for deployment
 */

const fs = require('fs');
const path = require('path');

// Bold and color output
const bold = str => `\x1b[1m${str}\x1b[0m`;
const green = str => `\x1b[32m${str}\x1b[0m`;
const red = str => `\x1b[31m${str}\x1b[0m`;
const yellow = str => `\x1b[33m${str}\x1b[0m`;

console.log(bold('\nGOLDEN KNIGHT CHESS CLUB - DEPLOYMENT CHECK\n'));
console.log(bold('Checking configuration for deployment readiness...\n'));

let passCount = 0;
let warnCount = 0;
let failCount = 0;

// Check Procfile
function checkProcfile() {
  console.log(bold('Checking Procfile:'));
  if (fs.existsSync('./Procfile')) {
    const procContent = fs.readFileSync('./Procfile', 'utf8').trim();
    if (procContent === 'web: node server/index.js') {
      console.log(green('✓ Procfile exists with correct configuration'));
      passCount++;
    } else {
      console.log(yellow('⚠ Procfile exists but may need updates. Should contain: web: node server/index.js'));
      warnCount++;
    }
  } else {
    console.log(red('✗ Procfile missing. Create one with: web: node server/index.js'));
    failCount++;
  }
  console.log();
}

// Check server configuration
function checkServerConfig() {
  console.log(bold('Checking server configuration:'));
  
  if (fs.existsSync('./server/index.js')) {
    const serverContent = fs.readFileSync('./server/index.js', 'utf8');
    
    // Check static file serving
    if (serverContent.includes('app.use(express.static(') && 
        serverContent.includes('/web/dist')) {
      console.log(green('✓ Static file serving configured correctly'));
      passCount++;
    } else {
      console.log(yellow('⚠ Static file serving might not be configured optimally'));
      warnCount++;
    }
    
    // Check CORS configuration
    if (serverContent.includes('app.use(cors(')) {
      if (serverContent.includes('origin: [') && 
          (serverContent.includes('*') || serverContent.includes('render.com'))) {
        console.log(green('✓ CORS configured for production'));
        passCount++;
      } else {
        console.log(yellow('⚠ CORS configuration might need updates for production'));
        warnCount++;
      }
    } else {
      console.log(red('✗ CORS middleware not found'));
      failCount++;
    }
    
    // Check WebSocket server
    if (serverContent.includes('WebSocketServer') && serverContent.includes('path: \'/ws\'')) {
      console.log(green('✓ WebSocket server configured correctly'));
      passCount++;
    } else {
      console.log(yellow('⚠ WebSocket server configuration might need updates'));
      warnCount++;
    }
  } else {
    console.log(red('✗ Server file (server/index.js) not found'));
    failCount++;
  }
  console.log();
}

// Check client configuration
function checkClientConfig() {
  console.log(bold('Checking client configuration:'));
  
  // Check vite config
  if (fs.existsSync('./web/vite.config.js')) {
    const viteContent = fs.readFileSync('./web/vite.config.js', 'utf8');
    
    if (viteContent.includes('host: \'0.0.0.0\'')) {
      console.log(green('✓ Vite configured with proper host'));
      passCount++;
    } else {
      console.log(yellow('⚠ Vite config might need host: \'0.0.0.0\' for proper binding'));
      warnCount++;
    }
  } else {
    console.log(red('✗ Vite config file not found'));
    failCount++;
  }
  
  // Check WebSocket client
  if (fs.existsSync('./web/src/utils/websocket.js')) {
    const wsContent = fs.readFileSync('./web/src/utils/websocket.js', 'utf8');
    
    if (wsContent.includes('const protocol = window.location.protocol === \'https:\' ? \'wss:\' : \'ws:\'')) {
      console.log(green('✓ WebSocket client configured for both development and production'));
      passCount++;
    } else {
      console.log(yellow('⚠ WebSocket client might need protocol detection for production'));
      warnCount++;
    }
  } else {
    console.log(yellow('⚠ WebSocket client file not found or in different location'));
    warnCount++;
  }
  console.log();
}

// Check environment variables
function checkEnvConfig() {
  console.log(bold('Checking environment configuration:'));
  
  if (fs.existsSync('./.env.example')) {
    const envContent = fs.readFileSync('./.env.example', 'utf8');
    
    // Check for essential variables
    const hasDatabaseUrl = envContent.includes('DATABASE_URL');
    const hasNodeEnv = envContent.includes('NODE_ENV');
    const hasPort = envContent.includes('PORT');
    
    if (hasDatabaseUrl && hasNodeEnv && hasPort) {
      console.log(green('✓ .env.example contains essential variables'));
      passCount++;
    } else {
      let missing = [];
      if (!hasDatabaseUrl) missing.push('DATABASE_URL');
      if (!hasNodeEnv) missing.push('NODE_ENV');
      if (!hasPort) missing.push('PORT');
      console.log(yellow(`⚠ .env.example missing some essential variables: ${missing.join(', ')}`));
      warnCount++;
    }
  } else {
    console.log(red('✗ .env.example file not found'));
    failCount++;
  }
  console.log();
}

// Check render.yaml
function checkRenderYaml() {
  console.log(bold('Checking render.yaml:'));
  
  if (fs.existsSync('./render.yaml')) {
    const renderContent = fs.readFileSync('./render.yaml', 'utf8');
    
    if (renderContent.includes('buildCommand') && 
        renderContent.includes('startCommand') && 
        renderContent.includes('fromDatabase')) {
      console.log(green('✓ render.yaml configured correctly'));
      passCount++;
    } else {
      console.log(yellow('⚠ render.yaml might need updates for proper configuration'));
      warnCount++;
    }
  } else {
    console.log(yellow('⚠ render.yaml file not found (optional but recommended)'));
    warnCount++;
  }
  console.log();
}

// Run checks
checkProcfile();
checkServerConfig();
checkClientConfig();
checkEnvConfig();
checkRenderYaml();

// Display summary
console.log(bold('DEPLOYMENT CHECK SUMMARY:'));
console.log(`${green(`${passCount} checks passed`)}, ${yellow(`${warnCount} warnings`)}, ${red(`${failCount} failures`)}\n`);

if (failCount === 0 && warnCount === 0) {
  console.log(green(bold('✓ Your application is ready for deployment!')));
} else if (failCount === 0) {
  console.log(yellow(bold('⚠ Your application may be ready for deployment, but has some non-critical issues.')));
} else {
  console.log(red(bold('✗ Your application has configuration issues that should be addressed before deployment.')));
}
console.log();

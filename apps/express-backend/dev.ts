#!/usr/bin/env tsx

import { spawn } from 'child_process';
import { watch } from 'fs';
import { join } from 'path';

console.log('🚀 Starting Express.js Backend in development mode...');
console.log('📁 Watching for changes in src/ directory...');
console.log('🔄 Auto-restarting on file changes...\n');

let serverProcess: any = null;

function startServer() {
  if (serverProcess) {
    console.log('🔄 Restarting server...');
    serverProcess.kill();
  }

  serverProcess = spawn('tsx', ['src/index.ts'], {
    stdio: 'inherit',
    shell: true,
  });

  serverProcess.on('error', (error: Error) => {
    console.error('❌ Error starting server:', error);
  });

  serverProcess.on('exit', (code: number) => {
    if (code !== 0) {
      console.log(`⚠️  Server exited with code ${code}`);
    }
  });
}

// Watch for changes in src directory
watch(join(__dirname, 'src'), { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.ts')) {
    console.log(`📝 File changed: ${filename}`);
    startServer();
  }
});

// Start server initially
startServer();

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  if (serverProcess) {
    serverProcess.kill();
  }
  process.exit(0);
});

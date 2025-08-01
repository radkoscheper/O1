#!/usr/bin/env node

// Production Build Script - Original Working Version
// This script was working in Stadium 27 deployment
// Ontdek Polen - Polish Travel Platform

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...');

try {
  // Build frontend
  console.log('Building frontend...');
  execSync('npm run build:frontend', { stdio: 'inherit' });

  // Build backend
  console.log('Building backend...');
  execSync('npm run build:backend', { stdio: 'inherit' });

  // Setup for deployment
  console.log('Preparing deployment files...');
  
  // Create API directory
  const apiDir = path.join('dist', 'public', 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // Copy server to API
  const serverPath = path.join('dist', 'index.js');
  const apiPath = path.join(apiDir, 'index.js');
  
  if (fs.existsSync(serverPath)) {
    fs.copyFileSync(serverPath, apiPath);
    console.log('✅ Build completed successfully');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
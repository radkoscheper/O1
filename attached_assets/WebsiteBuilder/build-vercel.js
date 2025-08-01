#!/usr/bin/env node

// Vercel Production Build Script
// Ontdek Polen - Polish Travel Platform
// Creates production-ready build for Vercel serverless deployment

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Vercel production build process...');

try {
  // Step 1: Install dependencies if needed
  console.log('📦 Ensuring all dependencies are installed...');
  execSync('npm install', { stdio: 'inherit' });

  // Step 2: Build frontend with Vite
  console.log('🏗️  Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit' });

  // Step 3: Build backend with esbuild
  console.log('⚙️  Building backend with esbuild...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  // Step 4: Setup API directory for Vercel serverless
  console.log('📁 Setting up API directory for Vercel...');
  const apiDir = path.join('dist', 'public', 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // Step 5: Copy server bundle to API endpoint
  const serverSource = path.join('dist', 'index.js');
  const serverDest = path.join('dist', 'public', 'api', 'index.js');

  if (fs.existsSync(serverSource)) {
    fs.copyFileSync(serverSource, serverDest);
    console.log('✅ Server bundle copied to API endpoint');
  } else {
    throw new Error('Server bundle not found');
  }

  // Step 6: Verify build output
  const buildStats = {
    frontend: fs.existsSync('dist/public/index.html'),
    serverBundle: fs.existsSync('dist/index.js'),
    apiEndpoint: fs.existsSync('dist/public/api/index.js')
  };

  console.log('📊 Build verification:', buildStats);

  if (buildStats.frontend && buildStats.serverBundle && buildStats.apiEndpoint) {
    console.log('🎉 Vercel build completed successfully!');
    console.log('📂 Output: dist/public/ (ready for deployment)');
  } else {
    throw new Error('Build verification failed');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
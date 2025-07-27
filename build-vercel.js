#!/usr/bin/env node

// Vercel build script to stay under 256 character limit
import { execSync } from 'child_process';

console.log('🚀 Starting Vercel build process...');

try {
  // Install dependencies including dev dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --include=dev', { stdio: 'inherit' });

  // Build frontend with production config
  console.log('🏗️ Building frontend...');
  execSync('npx vite build --config vite.config.production.ts', { stdio: 'inherit' });

  // Bundle routes for serverless function
  console.log('⚡ Bundling routes...');
  execSync('npx esbuild server/routes.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  // Bundle main server
  console.log('⚡ Bundling server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  console.log('✅ Vercel build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
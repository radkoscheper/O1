#!/usr/bin/env node

// Production build script voor Vercel deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏗️  Starting production build...');

try {
  // Build de client en server
  console.log('📦 Building client and server...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Check of alle bestanden zijn aangemaakt
  const distExists = fs.existsSync('dist');
  const publicExists = fs.existsSync('dist/public');
  const indexExists = fs.existsSync('dist/public/index.html');
  const serverExists = fs.existsSync('dist/index.js');
  
  if (!distExists || !publicExists || !indexExists || !serverExists) {
    throw new Error('Build output is incomplete');
  }
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Generated files:');
  console.log('   - dist/public/index.html (React app)');
  console.log('   - dist/public/assets/ (CSS & JS)');
  console.log('   - dist/index.js (Express server)');
  console.log('   - dist/public/images/ (Static assets)');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
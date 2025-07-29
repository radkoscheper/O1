import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Vercel production build...');

try {
  // Step 1: Build the client (React app)
  console.log('📦 Building client...');
  execSync('vite build', { stdio: 'inherit' });

  // Step 2: Build the server (Express API)
  console.log('⚙️ Building server...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });

  // Step 3: Ensure API directory exists for Vercel
  const apiDir = path.join('dist', 'public', 'api');
  if (!fs.existsSync(apiDir)) {
    fs.mkdirSync(apiDir, { recursive: true });
  }

  // Step 4: Copy server bundle to API endpoint
  const serverSource = path.join('dist', 'index.js');
  const serverDest = path.join('dist', 'public', 'api', 'index.js');
  
  if (fs.existsSync(serverSource)) {
    fs.copyFileSync(serverSource, serverDest);
    console.log('✅ Server bundle copied to API endpoint');
  }

  // Step 5: Verify build output
  const buildFiles = [
    'dist/public/index.html',
    'dist/public/api/index.js'
  ];

  let totalSize = 0;
  buildFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const sizeKB = Math.round(stats.size / 1024);
      console.log(`✅ ${file} (${sizeKB}KB)`);
      totalSize += sizeKB;
    } else {
      console.warn(`⚠️ Missing: ${file}`);
    }
  });

  console.log(`🎉 Vercel build completed successfully! Total: ${totalSize}KB`);
  
} catch (error) {
  console.error('❌ Vercel build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Vercel build process...');

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

  buildFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
    } else {
      console.warn(`⚠️ Missing: ${file}`);
    }
  });

  console.log('🎉 Vercel build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
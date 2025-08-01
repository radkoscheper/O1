import fs from 'fs';
import path from 'path';

console.log('🔧 Postbuild starting...');

// Ensure API directory exists for Vercel deployment
const apiDir = path.join('dist', 'public', 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
  console.log('📁 Created API directory:', apiDir);
}

// Copy server bundle to API endpoint
const serverSource = path.join('dist', 'index.js');
const serverDest = path.join('dist', 'public', 'api', 'index.js');

if (fs.existsSync(serverSource)) {
  fs.copyFileSync(serverSource, serverDest);
  console.log('✅ Server bundle copied to API endpoint for Vercel');
  console.log('📂 Source:', serverSource);
  console.log('📂 Destination:', serverDest);
} else {
  console.error('❌ Server bundle not found at:', serverSource);
  console.log('📂 Available files in dist/:', fs.readdirSync('dist/'));
  process.exit(1);
}

console.log('🎉 Postbuild completed successfully!');
import fs from 'fs';
import path from 'path';

// Ensure API directory exists for Vercel deployment
const apiDir = path.join('dist', 'public', 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Copy server bundle to API endpoint
const serverSource = path.join('dist', 'index.js');
const serverDest = path.join('dist', 'public', 'api', 'index.js');

if (fs.existsSync(serverSource)) {
  fs.copyFileSync(serverSource, serverDest);
  console.log('✅ Server bundle copied to API endpoint for Vercel');
} else {
  console.error('❌ Server bundle not found at:', serverSource);
  process.exit(1);
}
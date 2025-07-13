// Build script for Netlify deployment
const { execSync } = require('child_process');

try {
  console.log('Building client...');
  execSync('npm run build:client', { stdio: 'inherit' });
  
  console.log('Building server...');
  execSync('npm run build:server', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
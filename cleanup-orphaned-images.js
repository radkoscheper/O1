#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Cleaning up orphaned image files...');

// Get all image files in the guides and destinations directories
const imagesDir = path.join(__dirname, 'client', 'public', 'images');
const guidesDir = path.join(imagesDir, 'guides');
const destinationsDir = path.join(imagesDir, 'destinations');

// Get database content to check which images are still referenced
try {
  // Get all image references from the database
  const dbQuery = `
    SELECT image FROM guides WHERE image IS NOT NULL AND image != ''
    UNION ALL
    SELECT image FROM destinations WHERE image IS NOT NULL AND image != '';
  `;
  
  console.log('📋 Checking database for image references...');
  
  // Get referenced images from database
  const result = execSync(`psql "${process.env.DATABASE_URL}" -t -c "${dbQuery}"`, { encoding: 'utf8' });
  const referencedImages = result
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line !== '')
    .map(imagePath => {
      // Convert database path to filename
      return path.basename(imagePath);
    });

  console.log(`Found ${referencedImages.length} images referenced in database`);

  // Check guides directory
  if (fs.existsSync(guidesDir)) {
    const guideFiles = fs.readdirSync(guidesDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );
    
    console.log(`\n📁 Checking ${guideFiles.length} files in guides directory...`);
    
    let deletedCount = 0;
    for (const file of guideFiles) {
      if (!referencedImages.includes(file)) {
        const filePath = path.join(guidesDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`❌ Deleted orphaned guide image: ${file}`);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting ${file}:`, error.message);
        }
      } else {
        console.log(`✅ Keeping referenced image: ${file}`);
      }
    }
    
    console.log(`Deleted ${deletedCount} orphaned guide images`);
  }

  // Check destinations directory
  if (fs.existsSync(destinationsDir)) {
    const destFiles = fs.readdirSync(destinationsDir).filter(file => 
      file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
    );
    
    console.log(`\n📁 Checking ${destFiles.length} files in destinations directory...`);
    
    let deletedCount = 0;
    for (const file of destFiles) {
      if (!referencedImages.includes(file)) {
        const filePath = path.join(destinationsDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`❌ Deleted orphaned destination image: ${file}`);
          deletedCount++;
        } catch (error) {
          console.error(`Error deleting ${file}:`, error.message);
        }
      } else {
        console.log(`✅ Keeping referenced image: ${file}`);
      }
    }
    
    console.log(`Deleted ${deletedCount} orphaned destination images`);
  }

  console.log('\n🎉 Cleanup completed!');
  
} catch (error) {
  console.error('Error during cleanup:', error.message);
  process.exit(1);
}
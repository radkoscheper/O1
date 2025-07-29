/**
 * Cloudinary Migration Script
 * Migrates all local images to Cloudinary and updates database URLs
 */

import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { db } from './server/db.js';
import { destinations, activities, guides, siteSettings, motivation } from './shared/schema.js';
import { eq } from 'drizzle-orm';

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'df3i1avwb',
  api_key: '676472295591778',
  api_secret: 'FRXuPdduU8TR0Q7md8UWL9c0uUE',
  secure: true
});

// Local images directory
const IMAGES_DIR = path.join(process.cwd(), 'client/public/images');

interface MigrationResult {
  uploaded: Array<{
    localPath: string;
    cloudinaryUrl: string;
    publicId: string;
  }>;
  failed: Array<{
    localPath: string;
    error: string;
  }>;
  databaseUpdates: Array<{
    table: string;
    id: number;
    field: string;
    old: string;
    new: string;
  }>;
}

const migrationLog: MigrationResult = {
  uploaded: [],
  failed: [],
  databaseUpdates: []
};

/**
 * Recursively scan directory for image files
 */
function scanImages(dir: string, baseDir: string = IMAGES_DIR): Array<{
  localPath: string;
  relativePath: string;
  filename: string;
  category: string;
}> {
  const images: Array<any> = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip trash and other unwanted directories
      if (item === '.trash' || item === 'node_modules') continue;
      images.push(...scanImages(fullPath, baseDir));
    } else if (stat.isFile()) {
      // Check if it's an image file
      const ext = path.extname(item).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
        const relativePath = path.relative(baseDir, fullPath);
        images.push({
          localPath: fullPath,
          relativePath: relativePath.replace(/\\/g, '/'), // Normalize path separators
          filename: item,
          category: relativePath.split('/')[0] || 'misc'
        });
      }
    }
  }
  
  return images;
}

/**
 * Upload single image to Cloudinary
 */
async function uploadToCloudinary(imagePath: string, publicId: string, folder: string): Promise<string | null> {
  try {
    console.log(`Uploading: ${imagePath} -> ${folder}/${publicId}`);
    
    const result = await cloudinary.uploader.upload(imagePath, {
      public_id: publicId,
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });
    
    migrationLog.uploaded.push({
      localPath: imagePath,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id
    });
    
    return result.secure_url;
  } catch (error: any) {
    console.error(`Failed to upload ${imagePath}:`, error.message);
    migrationLog.failed.push({
      localPath: imagePath,
      error: error.message
    });
    return null;
  }
}

/**
 * Generate Cloudinary public ID from file path
 */
function generatePublicId(relativePath: string, filename: string): string {
  const pathParts = relativePath.split('/');
  const nameWithoutExt = path.parse(filename).name;
  
  // Create meaningful public ID
  if (pathParts.length > 1) {
    return `${pathParts.slice(0, -1).join('/')}-${nameWithoutExt}`;
  }
  return nameWithoutExt;
}

/**
 * Find Cloudinary URL for local image path
 */
function findCloudinaryUrl(localPath: string): string | null {
  const relativePath = localPath.replace('/images/', '');
  const found = migrationLog.uploaded.find(item => 
    item.localPath.includes(relativePath) || 
    item.localPath.endsWith(path.basename(localPath))
  );
  return found ? found.cloudinaryUrl : null;
}

/**
 * Update database URLs from local to Cloudinary
 */
async function updateDatabaseUrls(): Promise<void> {
  console.log('\n=== UPDATING DATABASE URLs ===');
  
  try {
    // Update destinations
    const destinationRecords = await db.select().from(destinations);
    for (const dest of destinationRecords) {
      let updated = false;
      const updates: any = {};
      
      if (dest.image && dest.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(dest.image);
        if (cloudinaryUrl) {
          updates.image = cloudinaryUrl;
          updated = true;
        }
      }
      
      if (updated) {
        await db.update(destinations).set(updates).where(eq(destinations.id, dest.id));
        migrationLog.databaseUpdates.push({
          table: 'destinations',
          id: dest.id,
          field: 'image',
          old: dest.image || '',
          new: updates.image
        });
        console.log(`Updated destination ${dest.name}: ${dest.image} -> ${updates.image}`);
      }
    }
    
    // Update activities
    const activityRecords = await db.select().from(activities);
    for (const activity of activityRecords) {
      let updated = false;
      const updates: any = {};
      
      if (activity.image && activity.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(activity.image);
        if (cloudinaryUrl) {
          updates.image = cloudinaryUrl;
          updated = true;
        }
      }
      
      if (updated) {
        await db.update(activities).set(updates).where(eq(activities.id, activity.id));
        migrationLog.databaseUpdates.push({
          table: 'activities',
          id: activity.id,
          field: 'image',
          old: activity.image || '',
          new: updates.image
        });
        console.log(`Updated activity ${activity.name}: ${activity.image} -> ${updates.image}`);
      }
    }
    
    // Update guides
    const guideRecords = await db.select().from(guides);
    for (const guide of guideRecords) {
      let updated = false;
      const updates: any = {};
      
      if (guide.image && guide.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(guide.image);
        if (cloudinaryUrl) {
          updates.image = cloudinaryUrl;
          updated = true;
        }
      }
      
      if (updated) {
        await db.update(guides).set(updates).where(eq(guides.id, guide.id));
        migrationLog.databaseUpdates.push({
          table: 'guides',
          id: guide.id,
          field: 'image',
          old: guide.image || '',
          new: updates.image
        });
        console.log(`Updated guide ${guide.title}: ${guide.image} -> ${updates.image}`);
      }
    }
    
    // Update motivation
    const motivationRecords = await db.select().from(motivation);
    for (const motiv of motivationRecords) {
      let updated = false;
      const updates: any = {};
      
      if (motiv.image && motiv.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(motiv.image);
        if (cloudinaryUrl) {
          updates.image = cloudinaryUrl;
          updated = true;
        }
      }
      
      if (updated) {
        await db.update(motivation).set(updates).where(eq(motivation.id, motiv.id));
        migrationLog.databaseUpdates.push({
          table: 'motivation',
          id: motiv.id,
          field: 'image',
          old: motiv.image || '',
          new: updates.image
        });
        console.log(`Updated motivation: ${motiv.image} -> ${updates.image}`);
      }
    }
    
  } catch (error) {
    console.error('Database update error:', error);
  }
}

/**
 * Main migration function
 */
async function migrate(): Promise<void> {
  console.log('🚀 Starting Cloudinary Migration...\n');
  
  // Check if images directory exists
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    return;
  }
  
  // Scan all images
  console.log('=== SCANNING LOCAL IMAGES ===');
  const images = scanImages(IMAGES_DIR);
  console.log(`Found ${images.length} images to migrate\n`);
  
  if (images.length === 0) {
    console.log('No images found to migrate.');
    return;
  }
  
  // Upload images to Cloudinary (batch process)
  console.log('=== UPLOADING TO CLOUDINARY ===');
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    const publicId = generatePublicId(image.relativePath, image.filename);
    const folder = `ontdek-polen/${image.category}`;
    
    console.log(`[${i + 1}/${images.length}] Processing: ${image.relativePath}`);
    await uploadToCloudinary(image.localPath, publicId, folder);
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Update database URLs
  await updateDatabaseUrls();
  
  // Generate migration report
  console.log('\n=== MIGRATION COMPLETE ===');
  console.log(`✅ Uploaded: ${migrationLog.uploaded.length}`);
  console.log(`❌ Failed: ${migrationLog.failed.length}`);
  console.log(`📝 Database Updates: ${migrationLog.databaseUpdates.length}`);
  
  // Save detailed log
  fs.writeFileSync('migration-log.json', JSON.stringify(migrationLog, null, 2));
  console.log('\nDetailed log saved to: migration-log.json');
  
  // Show some sample URLs
  if (migrationLog.uploaded.length > 0) {
    console.log('\nSample Cloudinary URLs:');
    migrationLog.uploaded.slice(0, 5).forEach(item => {
      console.log(`${path.basename(item.localPath)} -> ${item.cloudinaryUrl}`);
    });
  }
  
  if (migrationLog.failed.length > 0) {
    console.log('\nFailed uploads:');
    migrationLog.failed.forEach(item => {
      console.log(`❌ ${path.basename(item.localPath)}: ${item.error}`);
    });
  }
}

// Run migration
migrate().catch(console.error);
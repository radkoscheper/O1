/**
 * Batch Cloudinary Migration Script
 * Migrates all images in smaller batches to avoid timeouts
 */

import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { db } from './server/db.js';
import { destinations, activities, guides, motivation } from './shared/schema.js';
import { eq } from 'drizzle-orm';

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'df3i1avwb',
  api_key: '676472295591778',
  api_secret: 'FRXuPdduU8TR0Q7md8UWL9c0uUE',
  secure: true
});

const IMAGES_DIR = path.join(process.cwd(), 'client/public/images');
const migrationLog: any = { uploaded: [], failed: [], databaseUpdates: [] };

function scanAllImages() {
  const allImages: any[] = [];
  
  function scanDir(dir: string, category: string) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDir(fullPath, category);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'].includes(ext)) {
          allImages.push({
            localPath: fullPath,
            filename: item,
            category: category,
            relativePath: path.relative(IMAGES_DIR, fullPath)
          });
        }
      }
    }
  }
  
  // Scan key directories
  scanDir(path.join(IMAGES_DIR, 'destinations'), 'destinations');
  scanDir(path.join(IMAGES_DIR, 'activities'), 'activities');
  scanDir(path.join(IMAGES_DIR, 'backgrounds'), 'backgrounds');
  scanDir(path.join(IMAGES_DIR, 'headers'), 'headers');
  scanDir(path.join(IMAGES_DIR, 'highlights'), 'highlights');
  scanDir(path.join(IMAGES_DIR, 'guides'), 'guides');
  scanDir(path.join(IMAGES_DIR, 'motivatie'), 'motivatie');
  
  return allImages;
}

async function uploadBatch(images: any[], batchSize: number = 10) {
  console.log(`\n=== UPLOADING BATCH OF ${images.length} IMAGES ===`);
  
  for (let i = 0; i < images.length; i += batchSize) {
    const batch = images.slice(i, i + batchSize);
    console.log(`\nProcessing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(images.length/batchSize)}`);
    
    for (const image of batch) {
      try {
        const fileName = path.basename(image.filename, path.extname(image.filename));
        const publicId = `${fileName}-${Date.now()}`;
        const folder = `ontdek-polen/${image.category}`;
        
        console.log(`Uploading: ${image.filename} -> ${folder}/${publicId}`);
        
        const result = await cloudinary.uploader.upload(image.localPath, {
          public_id: publicId,
          folder: folder,
          resource_type: 'auto',
          transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }]
        });
        
        migrationLog.uploaded.push({
          localPath: image.localPath,
          relativePath: image.relativePath,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id
        });
        
        console.log(`✅ ${image.filename} uploaded successfully`);
        
      } catch (error: any) {
        console.log(`❌ ${image.filename} failed: ${error.message}`);
        migrationLog.failed.push({
          localPath: image.localPath,
          error: error.message
        });
      }
      
      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Longer delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save progress periodically
    fs.writeFileSync('batch-migration-progress.json', JSON.stringify(migrationLog, null, 2));
  }
}

async function updateDatabaseUrls() {
  console.log('\n=== UPDATING DATABASE URLs ===');
  
  function findCloudinaryUrl(localPath: string): string | null {
    const relativePath = localPath.replace('/images/', '');
    const found = migrationLog.uploaded.find((item: any) => 
      item.relativePath === relativePath || 
      item.localPath.endsWith(path.basename(localPath))
    );
    return found ? found.cloudinaryUrl : null;
  }
  
  try {
    // Update destinations
    const destinationRecords = await db.select().from(destinations);
    for (const dest of destinationRecords) {
      if (dest.image && dest.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(dest.image);
        if (cloudinaryUrl) {
          await db.update(destinations)
            .set({ image: cloudinaryUrl })
            .where(eq(destinations.id, dest.id));
          
          console.log(`✅ Updated destination ${dest.name}`);
          migrationLog.databaseUpdates.push({
            table: 'destinations',
            id: dest.id,
            old: dest.image,
            new: cloudinaryUrl
          });
        }
      }
    }
    
    // Update activities
    const activityRecords = await db.select().from(activities);
    for (const activity of activityRecords) {
      if (activity.image && activity.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(activity.image);
        if (cloudinaryUrl) {
          await db.update(activities)
            .set({ image: cloudinaryUrl })
            .where(eq(activities.id, activity.id));
          
          console.log(`✅ Updated activity ${activity.name}`);
          migrationLog.databaseUpdates.push({
            table: 'activities',
            id: activity.id,
            old: activity.image,
            new: cloudinaryUrl
          });
        }
      }
    }
    
    // Update guides
    const guideRecords = await db.select().from(guides);
    for (const guide of guideRecords) {
      if (guide.image && guide.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(guide.image);
        if (cloudinaryUrl) {
          await db.update(guides)
            .set({ image: cloudinaryUrl })
            .where(eq(guides.id, guide.id));
          
          console.log(`✅ Updated guide ${guide.title}`);
          migrationLog.databaseUpdates.push({
            table: 'guides',
            id: guide.id,
            old: guide.image,
            new: cloudinaryUrl
          });
        }
      }
    }
    
    // Update motivation
    const motivationRecords = await db.select().from(motivation);
    for (const motiv of motivationRecords) {
      if (motiv.image && motiv.image.startsWith('/images/')) {
        const cloudinaryUrl = findCloudinaryUrl(motiv.image);
        if (cloudinaryUrl) {
          await db.update(motivation)
            .set({ image: cloudinaryUrl })
            .where(eq(motivation.id, motiv.id));
          
          console.log(`✅ Updated motivation`);
          migrationLog.databaseUpdates.push({
            table: 'motivation',
            id: motiv.id,
            old: motiv.image,
            new: cloudinaryUrl
          });
        }
      }
    }
    
  } catch (error) {
    console.error('Database update error:', error);
  }
}

async function batchMigrate() {
  console.log('🚀 Starting Batch Migration...\n');
  
  // Scan all images
  const allImages = scanAllImages();
  console.log(`Found ${allImages.length} images to migrate`);
  
  if (allImages.length === 0) {
    console.log('No images found to migrate.');
    return;
  }
  
  // Upload in batches
  await uploadBatch(allImages, 8); // Smaller batch size to avoid timeouts
  
  // Update database
  await updateDatabaseUrls();
  
  // Final report
  console.log('\n=== BATCH MIGRATION COMPLETE ===');
  console.log(`✅ Uploaded: ${migrationLog.uploaded.length}`);
  console.log(`❌ Failed: ${migrationLog.failed.length}`);
  console.log(`📝 Database Updates: ${migrationLog.databaseUpdates.length}`);
  
  // Save final results
  fs.writeFileSync('batch-migration-final.json', JSON.stringify(migrationLog, null, 2));
  console.log('\nFinal log saved to: batch-migration-final.json');
  
  if (migrationLog.uploaded.length > 0) {
    console.log('\nSample uploaded URLs:');
    migrationLog.uploaded.slice(0, 3).forEach((item: any) => {
      console.log(`${path.basename(item.localPath)} -> ${item.cloudinaryUrl}`);
    });
  }
}

batchMigrate().catch(console.error);
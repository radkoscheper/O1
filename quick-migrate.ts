/**
 * Quick Cloudinary Migration Script
 * Test migration for key images and database updates
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

const migrationLog: any = { uploaded: [], failed: [], databaseUpdates: [] };

async function quickMigrate() {
  console.log('🚀 Starting Quick Migration Test...\n');
  
  // Test upload key images first
  const testImages = [
    'client/public/images/destinations/krakow.jpg',
    'client/public/images/destinations/tatra.jpg', 
    'client/public/images/activities/placeholder.svg',
    'client/public/images/backgrounds/header.jpg'
  ];
  
  console.log('=== UPLOADING TEST IMAGES ===');
  for (const imagePath of testImages) {
    if (fs.existsSync(imagePath)) {
      try {
        const fileName = path.basename(imagePath, path.extname(imagePath));
        const folder = imagePath.includes('destinations') ? 'ontdek-polen/destinations' :
                      imagePath.includes('activities') ? 'ontdek-polen/activities' :
                      imagePath.includes('backgrounds') ? 'ontdek-polen/backgrounds' : 'ontdek-polen/misc';
        
        const result = await cloudinary.uploader.upload(imagePath, {
          public_id: fileName,
          folder: folder,
          resource_type: 'auto',
          transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }]
        });
        
        migrationLog.uploaded.push({
          localPath: imagePath,
          cloudinaryUrl: result.secure_url,
          publicId: result.public_id
        });
        
        console.log(`✅ ${path.basename(imagePath)} -> ${result.secure_url}`);
      } catch (error: any) {
        console.log(`❌ ${path.basename(imagePath)}: ${error.message}`);
        migrationLog.failed.push({ localPath: imagePath, error: error.message });
      }
    }
  }
  
  // Update a few database records as test
  console.log('\n=== UPDATING DATABASE URLS ===');
  
  try {
    // Find Krakow destination and update if has local image
    const krakowDest = await db.select().from(destinations).where(eq(destinations.slug, 'krakow')).limit(1);
    if (krakowDest[0] && krakowDest[0].image && krakowDest[0].image.startsWith('/images/')) {
      const cloudinaryUrl = migrationLog.uploaded.find((item: any) => 
        item.localPath.includes('krakow.jpg')
      )?.cloudinaryUrl;
      
      if (cloudinaryUrl) {
        await db.update(destinations)
          .set({ image: cloudinaryUrl })
          .where(eq(destinations.id, krakowDest[0].id));
        
        console.log(`✅ Updated Krakow destination: ${krakowDest[0].image} -> ${cloudinaryUrl}`);
        migrationLog.databaseUpdates.push({
          table: 'destinations',
          id: krakowDest[0].id,
          old: krakowDest[0].image,
          new: cloudinaryUrl
        });
      }
    }
    
    // Find activities with placeholder SVG
    const activitiesWithPlaceholder = await db.select().from(activities).where(eq(activities.image, '/images/activities/placeholder.svg')).limit(3);
    const placeholderUrl = migrationLog.uploaded.find((item: any) => 
      item.localPath.includes('placeholder.svg')
    )?.cloudinaryUrl;
    
    if (placeholderUrl && activitiesWithPlaceholder.length > 0) {
      for (const activity of activitiesWithPlaceholder) {
        await db.update(activities)
          .set({ image: placeholderUrl })
          .where(eq(activities.id, activity.id));
        
        console.log(`✅ Updated activity ${activity.name}: placeholder -> ${placeholderUrl}`);
        migrationLog.databaseUpdates.push({
          table: 'activities',
          id: activity.id,
          old: activity.image,
          new: placeholderUrl
        });
      }
    }
    
  } catch (error) {
    console.error('Database update error:', error);
  }
  
  // Save results
  fs.writeFileSync('quick-migration-log.json', JSON.stringify(migrationLog, null, 2));
  
  console.log('\n=== QUICK MIGRATION COMPLETE ===');
  console.log(`✅ Uploaded: ${migrationLog.uploaded.length}`);
  console.log(`❌ Failed: ${migrationLog.failed.length}`);  
  console.log(`📝 Database Updates: ${migrationLog.databaseUpdates.length}`);
  console.log('\nLog saved to: quick-migration-log.json');
}

quickMigrate().catch(console.error);
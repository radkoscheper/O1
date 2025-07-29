#!/usr/bin/env tsx

import { v2 as cloudinary } from 'cloudinary';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import * as fs from 'fs';

// Initialize database
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Initialize Cloudinary with hardcoded values for testing
cloudinary.config({
  cloud_name: 'df3i1avwb',
  api_key: '676472295591778', 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function quickMigrate() {
  const log = {
    timestamp: new Date().toISOString(),
    processed: [] as any[],
    failed: [] as any[]
  };

  try {
    console.log('🔍 Finding images with timestamp names...');
    
    // Get specific images with long timestamp names
    const images = [
      'ontdek-polen/destinations/tatra-1753802000119',
      'ontdek-polen/destinations/krakow-1753801956311',
      'ontdek-polen/destinations/gdansk-1753801929969',
      'ontdek-polen/destinations/bialowieza-1753801924802',
      'ontdek-polen/destinations/warschau-1753801922637'
    ];
    
    console.log(`Processing ${images.length} key images...\n`);
    
    for (const oldId of images) {
      try {
        // Extract destination name
        const destination = oldId.split('/')[2].split('-')[0];
        const cleanName = `main-header`;
        const newId = `ontdek-polen/destinations/${destination}/headers/${cleanName}`;
        
        console.log(`Renaming: ${oldId} → ${newId}`);
        
        // Rename in Cloudinary
        const result = await cloudinary.uploader.rename(oldId, newId, {
          resource_type: 'image',
          invalidate: true
        });
        
        // Update database
        const destinations = await db.select().from(schema.destinations);
        let dbUpdates = 0;
        
        for (const dest of destinations) {
          if (dest.image && dest.image.includes(oldId)) {
            await db.update(schema.destinations)
              .set({ image: result.secure_url })
              .where(eq(schema.destinations.id, dest.id));
            dbUpdates++;
            console.log(`  ✅ Updated destination ${dest.name}`);
          }
        }
        
        log.processed.push({
          old: oldId,
          new: newId,
          newUrl: result.secure_url,
          dbUpdates
        });
        
        console.log(`✅ Success: ${destination}/headers/${cleanName}\n`);
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error: any) {
        console.log(`❌ Failed: ${oldId} - ${error.message}\n`);
        log.failed.push({ id: oldId, error: error.message });
      }
    }
    
    // Save log
    fs.writeFileSync('quick-migration-log.json', JSON.stringify(log, null, 2));
    
    console.log('🎉 Quick Migration Complete!');
    console.log(`✅ Processed: ${log.processed.length}`);
    console.log(`❌ Failed: ${log.failed.length}`);
    
    if (log.processed.length > 0) {
      console.log('\n📁 New Structure:');
      log.processed.forEach(p => {
        console.log(`├── ${p.new}`);
      });
    }
    
  } catch (error: any) {
    console.error('Migration error:', error.message);
  }
}

quickMigrate().catch(console.error);
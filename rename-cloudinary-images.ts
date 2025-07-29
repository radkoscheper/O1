#!/usr/bin/env tsx

/**
 * Rename existing Cloudinary images to clean, user-friendly names
 * This will actually rename the images and update database URLs
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from './shared/schema';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

// Initialize database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Initialize Cloudinary
cloudinary.config({
  cloud_name: 'df3i1avwb',
  api_key: '676472295591778',
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface RenameLog {
  timestamp: string;
  renamed: Array<{
    oldPublicId: string;
    newPublicId: string;
    newUrl: string;
    friendlyName: string;
  }>;
  databaseUpdates: Array<{
    table: string;
    recordId: number;
    field: string;
    oldUrl: string;
    newUrl: string;
  }>;
  failed: Array<{
    publicId: string;
    reason: string;
  }>;
}

const renameLog: RenameLog = {
  timestamp: new Date().toISOString(),
  renamed: [],
  databaseUpdates: [],
  failed: []
};

/**
 * Extract destination name from public_id or create meaningful fallback
 */
function extractDestinationName(publicId: string): string {
  const cleanId = publicId.replace('ontdek-polen/destinations/', '');
  
  // Known destinations mapping
  const destinationMap: { [key: string]: string } = {
    'tatra': 'tatra',
    'krakow': 'krakow', 
    'gdansk': 'gdansk',
    'bialowieza': 'bialowieza',
    'warschau': 'warschau',
    'wroclaw': 'wroclaw',
    'poznan': 'poznan',
    'lodz': 'lodz',
    'lublin': 'lublin',
    'katowice': 'katowice',
    'zakopane': 'zakopane',
    'sopot': 'sopot',
    'torun': 'torun',
    'malbork': 'malbork',
    'wieliczka': 'wieliczka'
  };
  
  // Try exact matches first
  for (const [key, dest] of Object.entries(destinationMap)) {
    if (cleanId.toLowerCase().includes(key)) {
      return dest;
    }
  }
  
  // Extract first word as fallback
  const match = cleanId.match(/^([a-zA-Z]+)/);
  return match ? match[1].toLowerCase() : 'unknown';
}

/**
 * Generate user-friendly filename
 */
function generateFriendlyName(publicId: string, destination: string): string {
  const parts = publicId.split('/');
  const originalName = parts[parts.length - 1];
  
  // Remove timestamp and destination prefix to create clean name
  let cleanName = originalName
    .replace(/-\d{10,}/g, '') // Remove timestamps
    .replace(new RegExp(`^${destination}-?`, 'i'), '') // Remove destination prefix
    .replace(/^destinations?-?/i, '') // Remove "destinations" prefix
    .replace(/-+/g, '-') // Clean up multiple hyphens
    .replace(/^-|-$/g, ''); // Trim hyphens
  
  // Create meaningful fallback names
  if (!cleanName || cleanName.length < 2) {
    const fallbacks = [
      'main-header', 'city-view', 'landscape', 'overview', 
      'historic-center', 'skyline', 'architecture'
    ];
    const index = destination.charCodeAt(0) % fallbacks.length;
    cleanName = fallbacks[index];
  }
  
  return cleanName;
}

/**
 * Update database record with new URL
 */
async function updateDatabaseRecord(
  table: string, 
  recordId: number, 
  field: string, 
  newUrl: string
): Promise<boolean> {
  try {
    if (table === 'destinations') {
      await db.update(schema.destinations)
        .set({ [field]: newUrl })
        .where(eq(schema.destinations.id, recordId));
    } else if (table === 'activities') {
      await db.update(schema.activities)
        .set({ [field]: newUrl })
        .where(eq(schema.activities.id, recordId));
    } else if (table === 'guides') {
      await db.update(schema.guides)
        .set({ [field]: newUrl })
        .where(eq(schema.guides.id, recordId));
    }
    
    return true;
  } catch (error: any) {
    console.error(`Database update failed:`, error.message);
    return false;
  }
}

/**
 * Find database records using specific URL
 */
async function findDatabaseRecordsWithUrl(oldUrl: string): Promise<Array<{
  table: string;
  recordId: number;
  field: string;
}>> {
  const records = [];
  
  try {
    // Check destinations
    const destinations = await db.select().from(schema.destinations);
    destinations.forEach(dest => {
      if (dest.image === oldUrl) {
        records.push({ table: 'destinations', recordId: dest.id, field: 'image' });
      }
    });
    
    // Check activities  
    const activities = await db.select().from(schema.activities);
    activities.forEach(activity => {
      if (activity.image === oldUrl) {
        records.push({ table: 'activities', recordId: activity.id, field: 'image' });
      }
    });
    
    // Check guides
    const guides = await db.select().from(schema.guides);
    guides.forEach(guide => {
      if (guide.image === oldUrl) {
        records.push({ table: 'guides', recordId: guide.id, field: 'image' });
      }
    });
    
  } catch (error: any) {
    console.error('Error searching database:', error.message);
  }
  
  return records;
}

/**
 * Main renaming process
 */
async function main() {
  console.log('🔄 Starting Cloudinary Image Renaming Process...\n');
  
  try {
    // Get all destination images with timestamp names
    console.log('📋 Fetching images with timestamp names...');
    const result = await cloudinary.search
      .expression('folder:ontdek-polen/destinations AND public_id:*-[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]*')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
    
    const images = result.resources;
    console.log(`Found ${images.length} images to rename\n`);
    
    for (const image of images) {
      const oldPublicId = image.public_id;
      const oldUrl = image.secure_url;
      
      try {
        // Extract destination and generate friendly name
        const destination = extractDestinationName(oldPublicId);
        const friendlyName = generateFriendlyName(oldPublicId, destination);
        
        // Create new organized path
        const newPublicId = `ontdek-polen/destinations/${destination}/headers/${friendlyName}`;
        
        console.log(`Renaming: ${oldPublicId} → ${newPublicId}`);
        
        // Rename in Cloudinary
        const renameResult = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
          resource_type: 'auto',
          invalidate: true
        });
        
        renameLog.renamed.push({
          oldPublicId,
          newPublicId,
          newUrl: renameResult.secure_url,
          friendlyName
        });
        
        // Find and update database records
        const dbRecords = await findDatabaseRecordsWithUrl(oldUrl);
        
        for (const record of dbRecords) {
          const success = await updateDatabaseRecord(
            record.table,
            record.recordId, 
            record.field,
            renameResult.secure_url
          );
          
          if (success) {
            renameLog.databaseUpdates.push({
              table: record.table,
              recordId: record.recordId,
              field: record.field,
              oldUrl,
              newUrl: renameResult.secure_url
            });
            console.log(`  ✅ Updated ${record.table} record ${record.recordId}`);
          }
        }
        
        console.log(`✅ Renamed to: ${friendlyName}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error: any) {
        console.log(`❌ Failed to rename ${oldPublicId}: ${error.message}`);
        renameLog.failed.push({
          publicId: oldPublicId,
          reason: error.message
        });
      }
    }
    
    // Save results
    fs.writeFileSync(
      'cloudinary-rename-log.json', 
      JSON.stringify(renameLog, null, 2)
    );
    
    // Summary
    console.log('\n🎉 Renaming Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Successfully renamed: ${renameLog.renamed.length}`);
    console.log(`🔄 Database updates: ${renameLog.databaseUpdates.length}`);
    console.log(`❌ Failed: ${renameLog.failed.length}`);
    console.log('═══════════════════════════════════════');
    
    if (renameLog.renamed.length > 0) {
      console.log('\n📁 New Clean Structure:');
      const uniqueDestinations = [...new Set(renameLog.renamed.map(r => r.newPublicId.split('/')[2]))];
      uniqueDestinations.forEach(dest => {
        const images = renameLog.renamed.filter(r => r.newPublicId.includes(`/${dest}/`));
        console.log(`├── destinations/${dest}/headers/`);
        images.forEach(img => {
          console.log(`│   ├── ${img.friendlyName}`);
        });
      });
    }
    
    console.log('\n📄 Full log saved to cloudinary-rename-log.json');
    
  } catch (error: any) {
    console.error('\n💥 Fatal Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
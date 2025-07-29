#!/usr/bin/env tsx

/**
 * Cloudinary Image Restructure Script
 * 
 * This script will:
 * 1. Create proper hierarchical folder structure in Cloudinary
 * 2. Move existing images to organized folders with clean names
 * 3. Update database URLs to new paths
 * 4. Generate audit trail of all changes
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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface RestructureLog {
  timestamp: string;
  restructured: Array<{
    oldPath: string;
    newPath: string;
    friendlyName: string;
    cloudinaryUrl: string;
    publicId: string;
  }>;
  databaseUpdates: Array<{
    table: string;
    recordId: number;
    field: string;
    oldUrl: string;
    newUrl: string;
  }>;
  failed: Array<{
    path: string;
    reason: string;
  }>;
  summary: {
    totalProcessed: number;
    successful: number;
    failed: number;
    databaseUpdates: number;
  };
}

const restructureLog: RestructureLog = {
  timestamp: new Date().toISOString(),
  restructured: [],
  databaseUpdates: [],
  failed: [],
  summary: { totalProcessed: 0, successful: 0, failed: 0, databaseUpdates: 0 }
};

/**
 * Generate clean, user-friendly filename from existing path
 */
function generateFriendlyName(publicId: string, destinationName?: string): string {
  const parts = publicId.split('/');
  const filename = parts[parts.length - 1];
  
  // Remove timestamp patterns and destination prefixes
  let cleanName = filename
    .replace(/-\d{13,}/g, '') // Remove long timestamps
    .replace(new RegExp(`^${destinationName?.toLowerCase()}-?`, 'i'), '') // Remove destination prefix
    .replace(/^destinations?-?/i, '') // Remove "destinations" prefix
    .replace(/^ontdek-polen-?/i, '') // Remove project prefix
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-|-$/g, ''); // Trim hyphens
  
  // If we end up with empty or very short name, use destination-based fallback
  if (!cleanName || cleanName.length < 3) {
    cleanName = destinationName ? `${destinationName.toLowerCase()}-header` : 'main-header';
  }
  
  return cleanName;
}

/**
 * Get new organized path structure
 */
function getNewPath(oldPublicId: string, contentType: 'destinations' | 'activities' | 'guides' | 'general'): {
  folder: string;
  filename: string;
  category: string;
} {
  const parts = oldPublicId.split('/');
  const filename = parts[parts.length - 1];
  
  if (contentType === 'destinations') {
    // Extract destination name from old path or filename
    let destinationName = 'unknown';
    
    // Try to extract from existing folder structure
    if (parts.includes('destinations') && parts.length > 2) {
      const destIndex = parts.indexOf('destinations');
      if (parts[destIndex + 1]) {
        destinationName = parts[destIndex + 1].replace(/-\d+$/, ''); // Remove any trailing numbers
      }
    } else {
      // Extract from filename
      const match = filename.match(/^([a-zA-Z]+)/);
      if (match) {
        destinationName = match[1].toLowerCase();
      }
    }
    
    const friendlyName = generateFriendlyName(oldPublicId, destinationName);
    
    return {
      folder: `ontdek-polen/destinations/${destinationName}`,
      filename: friendlyName,
      category: 'headers' // Default to headers for now
    };
  }
  
  if (contentType === 'activities') {
    const friendlyName = generateFriendlyName(oldPublicId);
    return {
      folder: 'ontdek-polen/activities',
      filename: friendlyName,
      category: 'general'
    };
  }
  
  // Default fallback
  return {
    folder: 'ontdek-polen/general',
    filename: generateFriendlyName(oldPublicId),
    category: 'misc'
  };
}

/**
 * Move image in Cloudinary to new organized location
 */
async function moveCloudinaryImage(oldPublicId: string, newPublicId: string): Promise<string | null> {
  try {
    console.log(`Moving: ${oldPublicId} → ${newPublicId}`);
    
    // Use Cloudinary's rename API to move the image
    const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      resource_type: 'auto',
      invalidate: true // Clear CDN cache
    });
    
    return result.secure_url;
  } catch (error: any) {
    console.error(`Failed to move ${oldPublicId}:`, error.message);
    return null;
  }
}

/**
 * Update database record with new URL
 */
async function updateDatabaseUrl(
  table: string, 
  recordId: number, 
  field: string, 
  oldUrl: string, 
  newUrl: string
): Promise<boolean> {
  try {
    console.log(`Updating ${table}.${field} for record ${recordId}`);
    
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
    // Add more tables as needed
    
    restructureLog.databaseUpdates.push({
      table,
      recordId,
      field,
      oldUrl,
      newUrl
    });
    
    return true;
  } catch (error: any) {
    console.error(`Failed to update database:`, error.message);
    return false;
  }
}

/**
 * Find all database records using old Cloudinary URLs
 */
async function findDatabaseReferences(): Promise<Array<{
  table: string;
  recordId: number;
  field: string;
  currentUrl: string;
}>> {
  const references: Array<{
    table: string;
    recordId: number;
    field: string;
    currentUrl: string;
  }> = [];
  
  try {
    // Check destinations table
    const destinations = await db.select().from(schema.destinations);
    destinations.forEach(dest => {
      if (dest.image?.includes('res.cloudinary.com')) {
        references.push({
          table: 'destinations',
          recordId: dest.id,
          field: 'image',
          currentUrl: dest.image
        });
      }
    });
    
    // Check activities table
    const activities = await db.select().from(schema.activities);
    activities.forEach(activity => {
      if (activity.image?.includes('res.cloudinary.com')) {
        references.push({
          table: 'activities',
          recordId: activity.id,
          field: 'image',
          currentUrl: activity.image
        });
      }
    });
    
    // Check guides table
    const guides = await db.select().from(schema.guides);
    guides.forEach(guide => {
      if (guide.image?.includes('res.cloudinary.com')) {
        references.push({
          table: 'guides',
          recordId: guide.id,
          field: 'image',
          currentUrl: guide.image
        });
      }
    });
    
    console.log(`Found ${references.length} database references to update`);
    return references;
    
  } catch (error: any) {
    console.error('Error finding database references:', error.message);
    return [];
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
function extractPublicId(cloudinaryUrl: string): string | null {
  const match = cloudinaryUrl.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|svg)$/i);
  return match ? match[1] : null;
}

/**
 * Main restructure process
 */
async function main() {
  console.log('🚀 Starting Cloudinary Restructure Process...\n');
  
  try {
    // 1. Get all existing Cloudinary images in flat structure
    console.log('📋 Fetching existing Cloudinary images...');
    const result = await cloudinary.search
      .expression('folder:ontdek-polen/destinations OR folder:ontdek-polen/activities')
      .sort_by('created_at', 'desc')
      .max_results(500)
      .execute();
    
    const images = result.resources;
    console.log(`Found ${images.length} images to restructure\n`);
    
    // 2. Find all database references
    console.log('🔍 Finding database references...');
    const dbReferences = await findDatabaseReferences();
    console.log(`Found ${dbReferences.length} database records to update\n`);
    
    // 3. Process each image
    console.log('🔄 Processing images...\n');
    
    for (const image of images) {
      restructureLog.summary.totalProcessed++;
      
      try {
        const oldPublicId = image.public_id;
        
        // Determine content type from folder
        let contentType: 'destinations' | 'activities' | 'general' = 'general';
        if (oldPublicId.includes('/destinations/')) {
          contentType = 'destinations';
        } else if (oldPublicId.includes('/activities/')) {
          contentType = 'activities';
        }
        
        // Get new organized path
        const newPathInfo = getNewPath(oldPublicId, contentType);
        const newPublicId = `${newPathInfo.folder}/${newPathInfo.category}/${newPathInfo.filename}`;
        
        // Skip if already in correct structure
        if (oldPublicId === newPublicId) {
          console.log(`✓ Already organized: ${oldPublicId}`);
          continue;
        }
        
        // Move image in Cloudinary
        const newUrl = await moveCloudinaryImage(oldPublicId, newPublicId);
        
        if (newUrl) {
          restructureLog.restructured.push({
            oldPath: oldPublicId,
            newPath: newPublicId,
            friendlyName: newPathInfo.filename,
            cloudinaryUrl: newUrl,
            publicId: newPublicId
          });
          
          // Update database references
          const relatedDbRefs = dbReferences.filter(ref => 
            extractPublicId(ref.currentUrl) === oldPublicId
          );
          
          for (const dbRef of relatedDbRefs) {
            const success = await updateDatabaseUrl(
              dbRef.table,
              dbRef.recordId,
              dbRef.field,
              dbRef.currentUrl,
              newUrl
            );
            
            if (success) {
              restructureLog.summary.databaseUpdates++;
            }
          }
          
          restructureLog.summary.successful++;
          console.log(`✅ Restructured: ${newPathInfo.filename}`);
          
        } else {
          restructureLog.failed.push({
            path: oldPublicId,
            reason: 'Cloudinary move failed'
          });
          restructureLog.summary.failed++;
          console.log(`❌ Failed: ${oldPublicId}`);
        }
        
        // Rate limiting - pause between operations
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error: any) {
        restructureLog.failed.push({
          path: image.public_id,
          reason: error.message
        });
        restructureLog.summary.failed++;
        console.log(`❌ Error processing ${image.public_id}: ${error.message}`);
      }
    }
    
    // 4. Save audit log
    console.log('\n📄 Saving restructure audit log...');
    fs.writeFileSync(
      'cloudinary-restructure-log.json', 
      JSON.stringify(restructureLog, null, 2)
    );
    
    // 5. Summary
    console.log('\n🎉 Restructure Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total Processed: ${restructureLog.summary.totalProcessed}`);
    console.log(`✅ Successfully Restructured: ${restructureLog.summary.successful}`);
    console.log(`❌ Failed: ${restructureLog.summary.failed}`);
    console.log(`🔄 Database Updates: ${restructureLog.summary.databaseUpdates}`);
    console.log('═══════════════════════════════════════');
    
    if (restructureLog.summary.failed > 0) {
      console.log('\n⚠️ Some operations failed. Check cloudinary-restructure-log.json for details.');
    }
    
    console.log('\n📁 New Folder Structure Created:');
    console.log('ontdek-polen/');
    console.log('├── destinations/');
    console.log('│   ├── krakow/headers/');
    console.log('│   ├── tatra/headers/');
    console.log('│   └── gdansk/headers/');
    console.log('├── activities/general/');
    console.log('└── general/misc/');
    
  } catch (error: any) {
    console.error('\n💥 Fatal Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

export default main;
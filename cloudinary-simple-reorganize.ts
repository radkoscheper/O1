#!/usr/bin/env tsx

/**
 * Simple Cloudinary Reorganization Script
 * Reorganizes existing images into proper folder structure
 */

import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary with environment variables
cloudinary.config({
  cloud_name: 'df3i1avwb',
  api_key: '676472295591778',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YourSecretHere',
});

interface ReorganizeResult {
  moved: Array<{ from: string; to: string; newUrl: string }>;
  failed: Array<{ path: string; error: string }>;
}

/**
 * Extract destination name from public_id or filename
 */
function extractDestinationName(publicId: string): string {
  // Remove ontdek-polen prefix and look for destination patterns
  const cleanId = publicId.replace('ontdek-polen/', '').replace('destinations/', '');
  
  // Common destination patterns
  const destinations = [
    'krakow', 'tatra', 'gdansk', 'bialowieza', 'warschau', 'wroclaw', 
    'poznan', 'lodz', 'lublin', 'katowice', 'zakopane', 'sopot'
  ];
  
  for (const dest of destinations) {
    if (cleanId.toLowerCase().includes(dest)) {
      return dest;
    }
  }
  
  // Fallback: try first word before dash or underscore
  const match = cleanId.match(/^([a-zA-Z]+)/);
  return match ? match[1].toLowerCase() : 'general';
}

/**
 * Generate clean filename from existing public_id
 */
function generateCleanFilename(publicId: string, destination: string): string {
  const parts = publicId.split('/');
  const originalName = parts[parts.length - 1];
  
  // Remove timestamp patterns and clean up
  let cleanName = originalName
    .replace(/-\d{13,}/g, '') // Remove long timestamps
    .replace(new RegExp(`^${destination}-?`, 'i'), '') // Remove destination prefix
    .replace(/^destinations?-?/i, '') // Remove "destinations" prefix
    .replace(/-+/g, '-') // Multiple hyphens to single
    .replace(/^-|-$/g, ''); // Trim hyphens
  
  // If we end up with empty or very short name, use fallback
  if (!cleanName || cleanName.length < 2) {
    cleanName = 'header-image';
  }
  
  return cleanName;
}

/**
 * Reorganize images into proper folder structure
 */
async function reorganizeImages(): Promise<ReorganizeResult> {
  const result: ReorganizeResult = { moved: [], failed: [] };
  
  try {
    console.log('🔍 Fetching existing images...');
    
    // Get all images in destinations folder
    const searchResult = await cloudinary.search
      .expression('folder:ontdek-polen/destinations')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();
    
    console.log(`Found ${searchResult.resources.length} images to reorganize\n`);
    
    for (const image of searchResult.resources) {
      const oldPublicId = image.public_id;
      
      // Skip if already in organized structure (contains subfolder like /headers/)
      if (oldPublicId.split('/').length > 3) {
        console.log(`✓ Already organized: ${oldPublicId}`);
        continue;
      }
      
      try {
        const destination = extractDestinationName(oldPublicId);
        const cleanFilename = generateCleanFilename(oldPublicId, destination);
        const newPublicId = `ontdek-polen/destinations/${destination}/headers/${cleanFilename}`;
        
        console.log(`Moving: ${oldPublicId} → ${newPublicId}`);
        
        // Rename/move the image
        const moveResult = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
          resource_type: 'auto',
          invalidate: true
        });
        
        result.moved.push({
          from: oldPublicId,
          to: newPublicId,
          newUrl: moveResult.secure_url
        });
        
        console.log(`✅ Moved: ${cleanFilename} to ${destination}/headers/`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.log(`❌ Failed to move ${oldPublicId}: ${error.message}`);
        result.failed.push({
          path: oldPublicId,
          error: error.message
        });
      }
    }
    
  } catch (error: any) {
    console.error('Fatal error:', error.message);
    result.failed.push({
      path: 'GLOBAL',
      error: error.message
    });
  }
  
  return result;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Cloudinary Reorganization...\n');
  
  const result = await reorganizeImages();
  
  console.log('\n🎉 Reorganization Complete!');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Successfully moved: ${result.moved.length}`);
  console.log(`❌ Failed: ${result.failed.length}`);
  console.log('═══════════════════════════════════════');
  
  if (result.moved.length > 0) {
    console.log('\n📁 New Structure Created:');
    const destinations = [...new Set(result.moved.map(m => m.to.split('/')[2]))];
    destinations.forEach(dest => {
      console.log(`├── destinations/${dest}/headers/`);
    });
  }
  
  if (result.failed.length > 0) {
    console.log('\n⚠️ Failed operations:');
    result.failed.forEach(f => console.log(`   ${f.path}: ${f.error}`));
  }
  
  // Save results
  require('fs').writeFileSync(
    'cloudinary-reorganize-results.json',
    JSON.stringify(result, null, 2)
  );
  
  console.log('\n📄 Results saved to cloudinary-reorganize-results.json');
}

main().catch(console.error);
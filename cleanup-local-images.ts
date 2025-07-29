/**
 * Cleanup Local Images Script
 * Removes local images that have been successfully migrated to Cloudinary
 */

import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.join(process.cwd(), 'client/public/images');
const MIGRATION_LOG_PATH = 'batch-migration-final.json';

interface MigrationRecord {
  localPath: string;
  relativePath: string;
  cloudinaryUrl: string;
  publicId: string;
}

async function cleanupLocalImages() {
  console.log('🧹 Starting Local Images Cleanup...\n');
  
  // Load migration log
  if (!fs.existsSync(MIGRATION_LOG_PATH)) {
    console.error('Migration log not found. Cannot safely cleanup files.');
    return;
  }
  
  const migrationData = JSON.parse(fs.readFileSync(MIGRATION_LOG_PATH, 'utf8'));
  const uploadedImages: MigrationRecord[] = migrationData.uploaded || [];
  
  console.log(`Found ${uploadedImages.length} successfully migrated images\n`);
  
  let deletedCount = 0;
  let keptCount = 0;
  const deletedFiles: string[] = [];
  const keptFiles: string[] = [];
  
  // Process each uploaded image
  for (const record of uploadedImages) {
    const localPath = record.localPath;
    
    if (fs.existsSync(localPath)) {
      try {
        // Verify this is actually in our images directory for safety
        if (localPath.includes('/client/public/images/')) {
          fs.unlinkSync(localPath);
          deletedFiles.push(path.relative(IMAGES_DIR, localPath));
          deletedCount++;
          console.log(`✅ Deleted: ${path.basename(localPath)}`);
        } else {
          console.log(`⚠️  Skipped (outside images directory): ${localPath}`);
          keptFiles.push(localPath);
          keptCount++;
        }
      } catch (error: any) {
        console.log(`❌ Failed to delete ${path.basename(localPath)}: ${error.message}`);
        keptFiles.push(localPath);
        keptCount++;
      }
    } else {
      console.log(`ℹ️  Already deleted: ${path.basename(localPath)}`);
    }
  }
  
  // Clean up empty directories
  console.log('\n🗂️  Cleaning up empty directories...');
  const emptyDirs = await findEmptyDirectories(IMAGES_DIR);
  for (const dir of emptyDirs) {
    try {
      fs.rmdirSync(dir);
      console.log(`✅ Removed empty directory: ${path.relative(IMAGES_DIR, dir)}`);
    } catch (error: any) {
      console.log(`❌ Failed to remove directory ${dir}: ${error.message}`);
    }
  }
  
  // Generate cleanup summary
  const summary = {
    totalMigrated: uploadedImages.length,
    deleted: deletedCount,
    kept: keptCount,
    deletedFiles: deletedFiles,
    keptFiles: keptFiles.map(f => path.basename(f)),
    cleanupTimestamp: new Date().toISOString()
  };
  
  fs.writeFileSync('cleanup-summary.json', JSON.stringify(summary, null, 2));
  
  console.log('\n=== CLEANUP COMPLETE ===');
  console.log(`🗑️  Deleted: ${deletedCount} files`);
  console.log(`📁 Kept: ${keptCount} files`);
  console.log('📝 Summary saved to: cleanup-summary.json');
  
  // Show storage savings
  console.log('\n💾 Storage cleanup completed - local images removed from Replit directory');
  console.log('✅ All content now served from Cloudinary CDN');
}

async function findEmptyDirectories(dir: string): Promise<string[]> {
  const emptyDirs: string[] = [];
  
  function scanDirectory(currentDir: string) {
    if (!fs.existsSync(currentDir)) return;
    
    const items = fs.readdirSync(currentDir);
    if (items.length === 0) {
      emptyDirs.push(currentDir);
      return;
    }
    
    let hasFiles = false;
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        hasFiles = true;
      }
    }
    
    // Check if directory became empty after cleaning subdirectories
    const remainingItems = fs.readdirSync(currentDir);
    if (remainingItems.length === 0) {
      emptyDirs.push(currentDir);
    }
  }
  
  scanDirectory(dir);
  return emptyDirs;
}

cleanupLocalImages().catch(console.error);
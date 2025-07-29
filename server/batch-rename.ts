import { v2 as cloudinary } from 'cloudinary';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from '../shared/schema';

// Initialize database
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

/**
 * Batch rename Cloudinary images to clean names and update database
 */
export async function batchRenameImages() {
  const results = {
    renamed: [] as Array<{ old: string; new: string; url: string }>,
    failed: [] as Array<{ id: string; error: string }>,
    dbUpdates: 0
  };

  try {
    // Get images with timestamp names
    const searchResult = await cloudinary.search
      .expression('folder:ontdek-polen/destinations AND public_id:*-17538*')
      .max_results(50)
      .execute();

    console.log(`Found ${searchResult.resources.length} images to rename`);

    for (const image of searchResult.resources) {
      const oldId = image.public_id;
      const oldUrl = image.secure_url;
      
      try {
        // Extract destination from old ID
        const destination = extractDestination(oldId);
        const cleanName = generateCleanName(oldId, destination);
        const newId = `ontdek-polen/destinations/${destination}/headers/${cleanName}`;
        
        // Rename in Cloudinary
        const result = await cloudinary.uploader.rename(oldId, newId, {
          resource_type: 'auto',
          invalidate: true
        });
        
        results.renamed.push({
          old: oldId,
          new: newId,
          url: result.secure_url
        });
        
        // Update database records
        const updated = await updateDatabaseUrls(oldUrl, result.secure_url);
        results.dbUpdates += updated;
        
        console.log(`✅ Renamed: ${cleanName}`);
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        results.failed.push({ id: oldId, error: error.message });
        console.log(`❌ Failed: ${oldId} - ${error.message}`);
      }
    }
    
  } catch (error: any) {
    console.error('Batch rename error:', error.message);
  }
  
  return results;
}

function extractDestination(publicId: string): string {
  const clean = publicId.replace('ontdek-polen/destinations/', '');
  
  // Known destinations
  const destinations = ['tatra', 'krakow', 'gdansk', 'bialowieza', 'warschau', 'wroclaw', 'poznan'];
  
  for (const dest of destinations) {
    if (clean.toLowerCase().includes(dest)) {
      return dest;
    }
  }
  
  // Fallback
  const match = clean.match(/^([a-zA-Z]+)/);
  return match ? match[1].toLowerCase() : 'general';
}

function generateCleanName(publicId: string, destination: string): string {
  const parts = publicId.split('/');
  const original = parts[parts.length - 1];
  
  let clean = original
    .replace(/-\d{10,}/g, '') // Remove timestamps
    .replace(new RegExp(`^${destination}-?`, 'i'), '') // Remove destination prefix
    .replace(/^destinations?-?/i, '') // Remove destinations prefix
    .replace(/-+/g, '-') // Clean hyphens
    .replace(/^-|-$/g, ''); // Trim
  
  if (!clean || clean.length < 2) {
    clean = 'main-header';
  }
  
  return clean;
}

async function updateDatabaseUrls(oldUrl: string, newUrl: string): Promise<number> {
  let updates = 0;
  
  try {
    // Update destinations
    const destinations = await db.select().from(schema.destinations);
    for (const dest of destinations) {
      if (dest.image === oldUrl) {
        await db.update(schema.destinations)
          .set({ image: newUrl })
          .where(eq(schema.destinations.id, dest.id));
        updates++;
      }
    }
    
    // Update activities
    const activities = await db.select().from(schema.activities);
    for (const activity of activities) {
      if (activity.image === oldUrl) {
        await db.update(schema.activities)
          .set({ image: newUrl })
          .where(eq(schema.activities.id, activity.id));
        updates++;
      }
    }
    
  } catch (error: any) {
    console.error('Database update error:', error.message);
  }
  
  return updates;
}
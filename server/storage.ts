import { 
  users, destinations, guides, siteSettings,
  type User, type InsertUser, type UpdateUser,
  type Destination, type InsertDestination, type UpdateDestination,
  type Guide, type InsertGuide, type UpdateGuide,
  type SiteSettings, type InsertSiteSettings, type UpdateSiteSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, ne, and, gte, lt, gt, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<void>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getAllUsersExcept(userId: number): Promise<User[]>;
  
  // Destination operations
  getDestination(id: number): Promise<Destination | undefined>;
  getDestinationBySlug(slug: string): Promise<Destination | undefined>;
  getAllDestinations(): Promise<Destination[]>;
  getPublishedDestinations(): Promise<Destination[]>;
  getDeletedDestinations(): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: number, updates: UpdateDestination): Promise<Destination>;
  deleteDestination(id: number): Promise<void>;
  softDeleteDestination(id: number): Promise<void>;
  restoreDestination(id: number): Promise<Destination>;
  
  // Guide operations
  getGuide(id: number): Promise<Guide | undefined>;
  getGuideBySlug(slug: string): Promise<Guide | undefined>;
  getAllGuides(): Promise<Guide[]>;
  getPublishedGuides(): Promise<Guide[]>;
  getDeletedGuides(): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: number, updates: UpdateGuide): Promise<Guide>;
  deleteGuide(id: number): Promise<void>;
  softDeleteGuide(id: number): Promise<void>;
  restoreGuide(id: number): Promise<Guide>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(updates: UpdateSiteSettings): Promise<SiteSettings>;
  createDefaultSiteSettings(): Promise<SiteSettings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async updateUser(id: number, updates: UpdateUser): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    await db
      .update(users)
      .set({
        password: newPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllUsersExcept(userId: number): Promise<User[]> {
    return await db.select().from(users).where(ne(users.id, userId));
  }

  // Destination operations
  async getDestination(id: number): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.id, id));
    return destination || undefined;
  }

  async getDestinationBySlug(slug: string): Promise<Destination | undefined> {
    const [destination] = await db.select().from(destinations).where(eq(destinations.slug, slug));
    return destination || undefined;
  }

  async getAllDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations).orderBy(destinations.ranking, destinations.createdAt);
  }

  async getPublishedDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations).where(
      and(
        eq(destinations.published, true),
        eq(destinations.is_deleted, false)
      )
    ).orderBy(destinations.ranking, destinations.createdAt);
  }

  async getDeletedDestinations(): Promise<Destination[]> {
    const result = await db.execute(sql`SELECT * FROM destinations WHERE is_deleted = TRUE ORDER BY deleted_at DESC`);
    return result.rows as Destination[];
  }

  async createDestination(insertDestination: InsertDestination): Promise<Destination> {
    const [destination] = await db
      .insert(destinations)
      .values({
        ...insertDestination,
        updatedAt: new Date(),
      })
      .returning();
    return destination;
  }

  async updateDestination(id: number, updates: UpdateDestination): Promise<Destination> {
    // Handle ranking updates with automatic adjustment
    if (updates.ranking !== undefined && updates.ranking !== null) {
      await this.adjustDestinationRankings(id, updates.ranking);
    }
    
    const [destination] = await db
      .update(destinations)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(destinations.id, id))
      .returning();
    return destination;
  }

  private async adjustDestinationRankings(targetId: number, newRanking: number): Promise<void> {
    // Get current ranking of the target destination
    const [currentDestination] = await db.select().from(destinations).where(eq(destinations.id, targetId));
    if (!currentDestination) return;
    
    const oldRanking = currentDestination.ranking || 0;
    
    if (oldRanking === newRanking) return; // No change needed
    
    if (newRanking < oldRanking) {
      // Moving up in ranking (lower number = higher rank)
      // Shift down all destinations between newRanking and oldRanking
      await db
        .update(destinations)
        .set({ ranking: sql`ranking + 1`, updatedAt: new Date() })
        .where(
          and(
            gte(destinations.ranking, newRanking),
            lt(destinations.ranking, oldRanking),
            ne(destinations.id, targetId)
          )
        );
    } else {
      // Moving down in ranking (higher number = lower rank)
      // Shift up all destinations between oldRanking and newRanking
      await db
        .update(destinations)
        .set({ ranking: sql`ranking - 1`, updatedAt: new Date() })
        .where(
          and(
            gt(destinations.ranking, oldRanking),
            lte(destinations.ranking, newRanking),
            ne(destinations.id, targetId)
          )
        );
    }
  }

  async deleteDestination(id: number): Promise<void> {
    await db.delete(destinations).where(eq(destinations.id, id));
  }

  async softDeleteDestination(id: number): Promise<void> {
    await db.execute(sql`UPDATE destinations SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() WHERE id = ${id}`);
  }

  async restoreDestination(id: number): Promise<Destination> {
    await db.execute(sql`UPDATE destinations SET is_deleted = FALSE, deleted_at = NULL, updated_at = NOW() WHERE id = ${id}`);
    const result = await db.execute(sql`SELECT * FROM destinations WHERE id = ${id}`);
    return result.rows[0] as Destination;
  }

  // Guide operations
  async getGuide(id: number): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide || undefined;
  }

  async getGuideBySlug(slug: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.slug, slug));
    return guide || undefined;
  }

  async getAllGuides(): Promise<Guide[]> {
    return await db.select().from(guides).orderBy(guides.ranking, guides.createdAt);
  }

  async getPublishedGuides(): Promise<Guide[]> {
    return await db.select().from(guides).where(
      and(
        eq(guides.published, true),
        eq(guides.is_deleted, false)
      )
    ).orderBy(guides.ranking, guides.createdAt);
  }

  async getDeletedGuides(): Promise<Guide[]> {
    const result = await db.execute(sql`SELECT * FROM guides WHERE is_deleted = TRUE ORDER BY deleted_at DESC`);
    return result.rows as Guide[];
  }

  async createGuide(insertGuide: InsertGuide): Promise<Guide> {
    const [guide] = await db
      .insert(guides)
      .values({
        ...insertGuide,
        updatedAt: new Date(),
      })
      .returning();
    return guide;
  }

  async updateGuide(id: number, updates: UpdateGuide): Promise<Guide> {
    // Handle ranking updates with automatic adjustment
    if (updates.ranking !== undefined && updates.ranking !== null) {
      await this.adjustGuideRankings(id, updates.ranking);
    }
    
    const [guide] = await db
      .update(guides)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(guides.id, id))
      .returning();
    return guide;
  }

  private async adjustGuideRankings(targetId: number, newRanking: number): Promise<void> {
    // Get current ranking of the target guide
    const [currentGuide] = await db.select().from(guides).where(eq(guides.id, targetId));
    if (!currentGuide) return;
    
    const oldRanking = currentGuide.ranking || 0;
    
    if (oldRanking === newRanking) return; // No change needed
    
    if (newRanking < oldRanking) {
      // Moving up in ranking (lower number = higher rank)
      // Shift down all guides between newRanking and oldRanking
      await db
        .update(guides)
        .set({ ranking: sql`ranking + 1`, updatedAt: new Date() })
        .where(
          and(
            gte(guides.ranking, newRanking),
            lt(guides.ranking, oldRanking),
            ne(guides.id, targetId)
          )
        );
    } else {
      // Moving down in ranking (higher number = lower rank)
      // Shift up all guides between oldRanking and newRanking
      await db
        .update(guides)
        .set({ ranking: sql`ranking - 1`, updatedAt: new Date() })
        .where(
          and(
            gt(guides.ranking, oldRanking),
            lte(guides.ranking, newRanking),
            ne(guides.id, targetId)
          )
        );
    }
  }

  async deleteGuide(id: number): Promise<void> {
    await db.delete(guides).where(eq(guides.id, id));
  }

  async softDeleteGuide(id: number): Promise<void> {
    await db.execute(sql`UPDATE guides SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() WHERE id = ${id}`);
  }

  async restoreGuide(id: number): Promise<Guide> {
    await db.execute(sql`UPDATE guides SET is_deleted = FALSE, deleted_at = NULL, updated_at = NOW() WHERE id = ${id}`);
    const result = await db.execute(sql`SELECT * FROM guides WHERE id = ${id}`);
    return result.rows[0] as Guide;
  }

  // Site settings operations
  async getSiteSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.isActive, true)).limit(1);
    return settings;
  }

  async updateSiteSettings(updates: UpdateSiteSettings): Promise<SiteSettings> {
    const updatedData = { ...updates, updatedAt: new Date() };
    
    // First check if settings exist
    const existing = await this.getSiteSettings();
    
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set(updatedData)
        .where(eq(siteSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings if none exist
      return await this.createDefaultSiteSettings();
    }
  }

  async createDefaultSiteSettings(): Promise<SiteSettings> {
    const [settings] = await db
      .insert(siteSettings)
      .values({
        siteName: "Ontdek Polen",
        siteDescription: "Ontdek de mooiste plekken van Polen",
        metaKeywords: "Polen, reizen, vakantie, bestemmingen",
        favicon: "/favicon.ico",
        isActive: true
      })
      .returning();
    return settings;
  }
}

export const storage = new DatabaseStorage();

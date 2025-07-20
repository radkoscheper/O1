import { 
  users, destinations, guides, siteSettings, pages, templates, highlights, activities, searchConfigs,
  type User, type InsertUser, type UpdateUser,
  type Destination, type InsertDestination, type UpdateDestination,
  type Guide, type InsertGuide, type UpdateGuide,
  type SiteSettings, type InsertSiteSettings, type UpdateSiteSettings,
  type Page, type InsertPage, type UpdatePage,
  type Template, type InsertTemplate, type UpdateTemplate,
  type Highlight, type InsertHighlight, type UpdateHighlight,
  type Activity, type InsertActivity, type UpdateActivity,
  type SearchConfig, type InsertSearchConfig, type UpdateSearchConfig
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
  getActiveDestinations(): Promise<Destination[]>;
  getPublishedDestinations(): Promise<Destination[]>;
  getHomepageDestinations(): Promise<Destination[]>;
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
  getActiveGuides(): Promise<Guide[]>;
  getPublishedGuides(): Promise<Guide[]>;
  getHomepageGuides(): Promise<Guide[]>;
  getDeletedGuides(): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  updateGuide(id: number, updates: UpdateGuide): Promise<Guide>;
  deleteGuide(id: number): Promise<void>;
  softDeleteGuide(id: number): Promise<void>;
  restoreGuide(id: number): Promise<Guide>;
  
  // Page operations
  getPage(id: number): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getAllPages(): Promise<Page[]>;
  getPublishedPages(): Promise<Page[]>;
  getDeletedPages(): Promise<Page[]>;
  createPage(page: InsertPage): Promise<Page>;
  updatePage(id: number, updates: UpdatePage): Promise<Page>;
  deletePage(id: number): Promise<void>;
  softDeletePage(id: number): Promise<void>;
  restorePage(id: number): Promise<Page>;
  
  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getTemplateByName(name: string): Promise<Template | undefined>;
  getAllTemplates(): Promise<Template[]>;
  getActiveTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, updates: UpdateTemplate): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;
  
  // Site settings operations
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(updates: UpdateSiteSettings): Promise<SiteSettings>;
  createDefaultSiteSettings(): Promise<SiteSettings>;
  
  // Highlight operations
  getHighlight(id: number): Promise<Highlight | undefined>;
  getAllHighlights(): Promise<Highlight[]>;
  getActiveHighlights(): Promise<Highlight[]>;
  getHomepageHighlights(): Promise<Highlight[]>;
  getHighlightsByCategory(category: string): Promise<Highlight[]>;
  createHighlight(highlight: InsertHighlight): Promise<Highlight>;
  updateHighlight(id: number, updates: UpdateHighlight): Promise<Highlight>;
  deleteHighlight(id: number): Promise<void>;
  updateHighlightRanking(id: number, newRanking: number): Promise<void>;

  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getActivityBySlug(slug: string): Promise<Activity | undefined>;
  getAllActivities(): Promise<Activity[]>;
  getActiveActivities(): Promise<Activity[]>;
  getPublishedActivities(): Promise<Activity[]>;
  getFeaturedActivities(): Promise<Activity[]>;
  getHomepageActivities(): Promise<Activity[]>;
  getActivitiesByLocation(location: string): Promise<Activity[]>;
  getActivitiesByCategory(category: string): Promise<Activity[]>;
  getDeletedActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, updates: UpdateActivity): Promise<Activity>;
  deleteActivity(id: number): Promise<void>;
  softDeleteActivity(id: number): Promise<void>;
  restoreActivity(id: number): Promise<Activity>;

  // Search configuration operations
  getSearchConfig(id: number): Promise<SearchConfig | undefined>;
  getSearchConfigByContext(context: string): Promise<SearchConfig | undefined>;
  getAllSearchConfigs(): Promise<SearchConfig[]>;
  getActiveSearchConfigs(): Promise<SearchConfig[]>;
  createSearchConfig(searchConfig: InsertSearchConfig): Promise<SearchConfig>;
  updateSearchConfig(id: number, updates: UpdateSearchConfig): Promise<SearchConfig>;
  deleteSearchConfig(id: number): Promise<void>;

  // Search operations
  searchDestinations(query: string, location?: string): Promise<Destination[]>;
  searchActivities(query: string, location?: string, category?: string): Promise<Activity[]>;
  searchHighlights(query: string): Promise<Highlight[]>;
  searchGuides(query: string): Promise<Guide[]>;
  searchPages(query: string): Promise<Page[]>;
  searchTemplates(query: string): Promise<Template[]>;

  // Database monitoring operations
  getDatabaseStatus(): Promise<{
    connectionStatus: 'connected' | 'disconnected';
    databaseName: string;
    totalTables: number;
    totalRecords: number;
    lastBackup?: string;
    storageSize?: string;
    uptime?: string;
  }>;
  getTableStatistics(): Promise<{
    tableName: string;
    recordCount: number;
    lastUpdated?: string;
  }[]>;
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

  async getActiveDestinations(): Promise<Destination[]> {
    console.log("Running getActiveDestinations query...");
    const result = await db.select().from(destinations).where(eq(destinations.is_deleted, false)).orderBy(destinations.ranking, destinations.createdAt);
    console.log("getActiveDestinations result count:", result.length);
    console.log("Sample destinations:", result.slice(0, 5).map(d => `${d.id}: ${d.name}`));
    return result;
  }

  async getPublishedDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations).where(
      and(
        eq(destinations.published, true),
        eq(destinations.is_deleted, false)
      )
    ).orderBy(destinations.ranking, destinations.createdAt);
  }

  async getHomepageDestinations(): Promise<Destination[]> {
    const result = await db.execute(sql`SELECT * FROM destinations WHERE published = true AND is_deleted = false AND show_on_homepage = true ORDER BY ranking, created_at`);
    return result.rows as Destination[];
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

  async getActiveGuides(): Promise<Guide[]> {
    return await db.select().from(guides).where(eq(guides.is_deleted, false)).orderBy(guides.ranking, guides.createdAt);
  }

  async getPublishedGuides(): Promise<Guide[]> {
    return await db.select().from(guides).where(
      and(
        eq(guides.published, true),
        eq(guides.is_deleted, false)
      )
    ).orderBy(guides.ranking, guides.createdAt);
  }

  async getHomepageGuides(): Promise<Guide[]> {
    const result = await db.execute(sql`SELECT * FROM guides WHERE published = true AND is_deleted = false AND show_on_homepage = true ORDER BY ranking, created_at`);
    return result.rows as Guide[];
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

  // PAGE OPERATIONS
  async getPage(id: number): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async getAllPages(): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.is_deleted, false)).orderBy(pages.ranking);
  }

  async getPublishedPages(): Promise<Page[]> {
    return await db.select().from(pages)
      .where(and(eq(pages.published, true), eq(pages.is_deleted, false)))
      .orderBy(pages.ranking);
  }

  async getDeletedPages(): Promise<Page[]> {
    return await db.select().from(pages).where(eq(pages.is_deleted, true)).orderBy(pages.deleted_at);
  }

  async createPage(insertPage: InsertPage): Promise<Page> {
    const [page] = await db
      .insert(pages)
      .values({
        ...insertPage,
        updatedAt: new Date(),
      })
      .returning();
    return page;
  }

  async updatePage(id: number, updates: UpdatePage): Promise<Page> {
    // Handle ranking adjustment if needed
    if (updates.ranking !== undefined) {
      await this.adjustPageRankings(id, updates.ranking);
    }

    const [page] = await db
      .update(pages)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning();
    return page;
  }

  private async adjustPageRankings(targetId: number, newRanking: number): Promise<void> {
    const targetPage = await this.getPage(targetId);
    if (!targetPage) return;

    const oldRanking = targetPage.ranking;
    
    if (newRanking > oldRanking) {
      await db
        .update(pages)
        .set({ ranking: sql`${pages.ranking} - 1` })
        .where(and(
          gt(pages.ranking, oldRanking),
          lte(pages.ranking, newRanking),
          ne(pages.id, targetId),
          eq(pages.is_deleted, false)
        ));
    } else if (newRanking < oldRanking) {
      await db
        .update(pages)
        .set({ ranking: sql`${pages.ranking} + 1` })
        .where(and(
          gte(pages.ranking, newRanking),
          lt(pages.ranking, oldRanking),
          ne(pages.id, targetId),
          eq(pages.is_deleted, false)
        ));
    }
  }

  async deletePage(id: number): Promise<void> {
    await db.delete(pages).where(eq(pages.id, id));
  }

  async softDeletePage(id: number): Promise<void> {
    await db
      .update(pages)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));
  }

  async restorePage(id: number): Promise<Page> {
    const [page] = await db
      .update(pages)
      .set({
        is_deleted: false,
        deleted_at: null,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning();
    return page;
  }

  // TEMPLATE OPERATIONS
  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template;
  }

  async getTemplateByName(name: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.name, name));
    return template;
  }

  async getAllTemplates(): Promise<Template[]> {
    return await db.select().from(templates).orderBy(templates.name);
  }

  async getActiveTemplates(): Promise<Template[]> {
    return await db.select().from(templates).where(eq(templates.isActive, true)).orderBy(templates.name);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const [template] = await db
      .insert(templates)
      .values({
        ...insertTemplate,
        updatedAt: new Date(),
      })
      .returning();
    return template;
  }

  async updateTemplate(id: number, updates: UpdateTemplate): Promise<Template> {
    const [template] = await db
      .update(templates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, id))
      .returning();
    return template;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  // Highlight operations implementation
  async getHighlight(id: number): Promise<Highlight | undefined> {
    const [highlight] = await db.select().from(highlights).where(eq(highlights.id, id));
    return highlight || undefined;
  }

  async getAllHighlights(): Promise<Highlight[]> {
    return await db.select().from(highlights).orderBy(highlights.ranking, highlights.name);
  }

  async getActiveHighlights(): Promise<Highlight[]> {
    return await db.select().from(highlights)
      .where(eq(highlights.active, true))
      .orderBy(highlights.ranking, highlights.name);
  }

  async getHomepageHighlights(): Promise<Highlight[]> {
    return await db.select().from(highlights)
      .where(and(eq(highlights.active, true), eq(highlights.showOnHomepage, true)))
      .orderBy(highlights.ranking, highlights.name);
  }

  async getHighlightsByCategory(category: string): Promise<Highlight[]> {
    return await db.select().from(highlights)
      .where(and(eq(highlights.category, category), eq(highlights.active, true), eq(highlights.showOnHomepage, true)))
      .orderBy(highlights.ranking, highlights.name);
  }

  async createHighlight(insertHighlight: InsertHighlight): Promise<Highlight> {
    const result = await db
      .insert(highlights)
      .values({
        ...insertHighlight,
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async updateHighlight(id: number, updates: UpdateHighlight): Promise<Highlight> {
    const [highlight] = await db
      .update(highlights)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(highlights.id, id))
      .returning();
    return highlight;
  }

  async deleteHighlight(id: number): Promise<void> {
    await db.delete(highlights).where(eq(highlights.id, id));
  }

  async updateHighlightRanking(id: number, newRanking: number): Promise<void> {
    await db
      .update(highlights)
      .set({
        ranking: newRanking,
        updatedAt: new Date(),
      })
      .where(eq(highlights.id, id));
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity || undefined;
  }

  async getActivityBySlug(slug: string): Promise<Activity | undefined> {
    // Activities don't have slugs yet, return undefined for now
    return undefined;
  }

  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.is_deleted, false));
  }

  async getActiveActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(
      and(eq(activities.is_deleted, false), eq(activities.published, true))
    );
  }

  async getPublishedActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(
      and(eq(activities.is_deleted, false), eq(activities.published, true))
    );
  }

  async getFeaturedActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(
      and(
        eq(activities.is_deleted, false),
        eq(activities.published, true),
        eq(activities.featured, true)
      )
    ).orderBy(activities.ranking, activities.name);
  }

  async getHomepageActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(
      and(
        eq(activities.is_deleted, false),
        eq(activities.published, true),
        eq(activities.showOnHomepage, true)
      )
    );
  }

  async getActivitiesByLocation(location: string): Promise<Activity[]> {
    return await db.select().from(activities).where(
      and(
        eq(activities.is_deleted, false), 
        eq(activities.published, true),
        eq(activities.location, location)
      )
    ).orderBy(activities.ranking);
  }

  async getActivitiesByCategory(category: string): Promise<Activity[]> {
    return await db.select().from(activities).where(
      and(eq(activities.is_deleted, false), eq(activities.category, category))
    );
  }

  async getDeletedActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.is_deleted, true));
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const result = await db
      .insert(activities)
      .values({
        ...insertActivity,
        updatedAt: new Date(),
      })
      .returning();
    return result[0];
  }

  async updateActivity(id: number, updates: UpdateActivity): Promise<Activity> {
    const [activity] = await db
      .update(activities)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();
    return activity;
  }

  async deleteActivity(id: number): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  async softDeleteActivity(id: number): Promise<void> {
    await db
      .update(activities)
      .set({
        is_deleted: true,
        deleted_at: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id));
  }

  async restoreActivity(id: number): Promise<Activity> {
    const [activity] = await db
      .update(activities)
      .set({
        is_deleted: false,
        deleted_at: null,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, id))
      .returning();
    return activity;
  }

  // Search configuration operations
  async getSearchConfig(id: number): Promise<SearchConfig | undefined> {
    const [config] = await db.select().from(searchConfigs).where(eq(searchConfigs.id, id));
    return config || undefined;
  }

  async getSearchConfigByContext(context: string): Promise<SearchConfig | undefined> {
    const [config] = await db.select().from(searchConfigs).where(eq(searchConfigs.context, context));
    return config || undefined;
  }

  async getAllSearchConfigs(): Promise<SearchConfig[]> {
    return db.select().from(searchConfigs);
  }

  async getActiveSearchConfigs(): Promise<SearchConfig[]> {
    return db.select().from(searchConfigs).where(eq(searchConfigs.isActive, true));
  }

  async createSearchConfig(insertSearchConfig: InsertSearchConfig): Promise<SearchConfig> {
    const [config] = await db
      .insert(searchConfigs)
      .values({
        ...insertSearchConfig,
        updatedAt: new Date(),
      })
      .returning();
    return config;
  }

  async updateSearchConfig(id: number, updates: UpdateSearchConfig): Promise<SearchConfig> {
    const [config] = await db
      .update(searchConfigs)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(searchConfigs.id, id))
      .returning();
    return config;
  }

  async deleteSearchConfig(id: number): Promise<void> {
    await db.delete(searchConfigs).where(eq(searchConfigs.id, id));
  }

  // Search operations
  async searchDestinations(query: string, location?: string): Promise<Destination[]> {
    let whereCondition = and(
      eq(destinations.published, true),
      eq(destinations.is_deleted, false),
      sql`${destinations.name} ILIKE '%' || ${query} || '%'`
    );

    if (location) {
      whereCondition = and(
        whereCondition,
        sql`${destinations.location} ILIKE '%' || ${location} || '%'`
      );
    }

    return db.select().from(destinations).where(whereCondition);
  }

  async searchActivities(query: string, location?: string, category?: string): Promise<Activity[]> {
    let whereCondition = and(
      eq(activities.published, true),
      eq(activities.is_deleted, false),
      sql`${activities.name} ILIKE '%' || ${query} || '%'`
    );

    if (location) {
      whereCondition = and(
        whereCondition,
        sql`${activities.location} ILIKE '%' || ${location} || '%'`
      );
    }

    if (category) {
      whereCondition = and(
        whereCondition,
        sql`${activities.category} ILIKE '%' || ${category} || '%'`
      );
    }

    return db.select().from(activities).where(whereCondition);
  }

  async searchGuides(query: string): Promise<Guide[]> {
    const whereCondition = and(
      eq(guides.published, true),
      eq(guides.is_deleted, false),
      sql`${guides.title} ILIKE '%' || ${query} || '%'`
    );

    return db.select().from(guides).where(whereCondition);
  }

  async searchHighlights(query: string): Promise<Highlight[]> {
    const whereCondition = and(
      eq(highlights.active, true),
      sql`${highlights.name} ILIKE '%' || ${query} || '%'`
    );

    return db.select().from(highlights).where(whereCondition);
  }

  async searchPages(query: string): Promise<Page[]> {
    const whereCondition = and(
      eq(pages.published, true),
      eq(pages.is_deleted, false),
      sql`(${pages.title} ILIKE '%' || ${query} || '%' OR ${pages.content} ILIKE '%' || ${query} || '%')`
    );

    return db.select().from(pages).where(whereCondition);
  }

  async searchTemplates(query: string): Promise<Template[]> {
    const whereCondition = and(
      eq(templates.isActive, true),
      sql`(${templates.name} ILIKE '%' || ${query} || '%' OR ${templates.content} ILIKE '%' || ${query} || '%')`
    );

    return db.select().from(templates).where(whereCondition);
  }

  async getDatabaseStatus() {
    try {
      // Test database connection and get basic info
      const connectionTest = await db.execute(sql`SELECT 1`);
      const dbNameResult = await db.execute(sql`SELECT current_database()`);
      
      // Count all tables
      const tablesResult = await db.execute(sql`
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      // Get total records across all content tables
      const recordCounts = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(destinations),
        db.select({ count: sql<number>`count(*)` }).from(guides),
        db.select({ count: sql<number>`count(*)` }).from(pages),
        db.select({ count: sql<number>`count(*)` }).from(activities),
        db.select({ count: sql<number>`count(*)` }).from(highlights),
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(templates),
        db.select({ count: sql<number>`count(*)` }).from(searchConfigs)
      ]);
      
      const totalRecords = recordCounts.reduce((sum, result) => sum + result[0].count, 0);
      
      // Get database size (Neon specific)
      let storageSize = 'N/A';
      try {
        const sizeResult = await db.execute(sql`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `);
        storageSize = (sizeResult.rows[0] as any)?.size || 'N/A';
      } catch {
        // Fallback if permissions don't allow
        storageSize = 'Beperkte toegang';
      }

      return {
        connectionStatus: 'connected' as const,
        databaseName: (dbNameResult.rows[0] as any)?.current_database || 'ontdek-polen',
        totalTables: Number((tablesResult.rows[0] as any)?.table_count || 0),
        totalRecords,
        storageSize,
        uptime: 'N/A (Serverless)',
        lastBackup: 'Automatisch (Neon)'
      };
    } catch (error) {
      console.error('Database status check failed:', error);
      return {
        connectionStatus: 'disconnected' as const,
        databaseName: 'Onbekend',
        totalTables: 0,
        totalRecords: 0,
        storageSize: 'N/A',
        uptime: 'N/A',
        lastBackup: 'N/A'
      };
    }
  }

  async getTableStatistics() {
    try {
      const tableStats = await Promise.all([
        db.select({ 
          count: sql<number>`count(*)`,
          latest: sql<string>`max(updated_at)::text`
        }).from(destinations).then(result => ({
          tableName: 'Bestemmingen',
          recordCount: result[0].count,
          lastUpdated: result[0].latest ? new Date(result[0].latest).toLocaleDateString('nl-NL') : 'Onbekend'
        })),
        
        db.select({ 
          count: sql<number>`count(*)`,
          latest: sql<string>`max(updated_at)::text`
        }).from(guides).then(result => ({
          tableName: 'Reizen',
          recordCount: result[0].count,
          lastUpdated: result[0].latest ? new Date(result[0].latest).toLocaleDateString('nl-NL') : 'Onbekend'
        })),
        
        db.select({ 
          count: sql<number>`count(*)`,
          latest: sql<string>`max(updated_at)::text`
        }).from(pages).then(result => ({
          tableName: 'Pagina\'s',
          recordCount: result[0].count,
          lastUpdated: result[0].latest ? new Date(result[0].latest).toLocaleDateString('nl-NL') : 'Onbekend'
        })),
        
        db.select({ 
          count: sql<number>`count(*)`,
          latest: sql<string>`max(updated_at)::text`
        }).from(activities).then(result => ({
          tableName: 'Activiteiten',
          recordCount: result[0].count,
          lastUpdated: result[0].latest ? new Date(result[0].latest).toLocaleDateString('nl-NL') : 'Onbekend'
        })),
        
        db.select({ 
          count: sql<number>`count(*)`,
          latest: sql<string>`max(updated_at)::text`
        }).from(highlights).then(result => ({
          tableName: 'Hoogtepunten',
          recordCount: result[0].count,
          lastUpdated: result[0].latest ? new Date(result[0].latest).toLocaleDateString('nl-NL') : 'Onbekend'
        })),
        
        db.select({ 
          count: sql<number>`count(*)`,
          latest: sql<string>`max(updated_at)::text`
        }).from(users).then(result => ({
          tableName: 'Gebruikers',
          recordCount: result[0].count,
          lastUpdated: result[0].latest ? new Date(result[0].latest).toLocaleDateString('nl-NL') : 'Onbekend'
        })),
        
        db.select({ 
          count: sql<number>`count(*)`
        }).from(templates).then(result => ({
          tableName: 'Templates',
          recordCount: result[0].count,
          lastUpdated: 'Statisch'
        })),
        
        db.select({ 
          count: sql<number>`count(*)`
        }).from(searchConfigs).then(result => ({
          tableName: 'Zoek Configuraties',
          recordCount: result[0].count,
          lastUpdated: 'Statisch'
        }))
      ]);

      return tableStats;
    } catch (error) {
      console.error('Table statistics failed:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();

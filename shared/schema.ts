import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // "admin" or "user"
  canCreateContent: boolean("can_create_content").default(true),
  canEditContent: boolean("can_edit_content").default(true),
  canDeleteContent: boolean("can_delete_content").default(false),
  canManageUsers: boolean("can_manage_users").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references((): any => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  canCreateContent: true,
  canEditContent: true,
  canDeleteContent: true,
  canManageUsers: true,
  createdBy: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  username: true,
  role: true,
  canCreateContent: true,
  canEditContent: true,
  canDeleteContent: true,
  canManageUsers: true,
}).partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Huidig wachtwoord is verplicht"),
  newPassword: z.string().min(6, "Nieuw wachtwoord moet minimaal 6 karakters zijn"),
  confirmPassword: z.string().min(1, "Bevestig het nieuwe wachtwoord"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  userId: z.number(),
  newPassword: z.string().min(6, "Wachtwoord moet minimaal 6 karakters zijn"),
  confirmPassword: z.string().min(1, "Bevestig het wachtwoord"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type ResetPassword = z.infer<typeof resetPasswordSchema>;
export type User = typeof users.$inferSelect;

// Destinations table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"), // City or village name for organizing destinations
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  alt: text("alt").notNull(),
  content: text("content").notNull(),
  link: text("link"), // Optional link URL for the destination
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  showOnHomepage: boolean("show_on_homepage").default(true).notNull(), // Controls if shown on homepage
  ranking: integer("ranking").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

export const insertDestinationSchema = createInsertSchema(destinations).pick({
  name: true,
  location: true,
  slug: true,
  description: true,
  image: true,
  alt: true,
  content: true,
  link: true,
  featured: true,
  published: true,
  showOnHomepage: true,
  ranking: true,
  createdBy: true,
});

export const updateDestinationSchema = insertDestinationSchema.partial();

export type InsertDestination = z.infer<typeof insertDestinationSchema>;
export type UpdateDestination = z.infer<typeof updateDestinationSchema>;
export type Destination = typeof destinations.$inferSelect;

// Guides table
export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  alt: text("alt").notNull(),
  content: text("content").notNull(),
  link: text("link"), // Optional link URL for the guide
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  showOnHomepage: boolean("show_on_homepage").default(true).notNull(), // Controls if shown on homepage
  ranking: integer("ranking").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

export const insertGuideSchema = createInsertSchema(guides).pick({
  title: true,
  slug: true,
  description: true,
  image: true,
  alt: true,
  content: true,
  link: true,
  featured: true,
  published: true,
  showOnHomepage: true,
  ranking: true,
  createdBy: true,
});

export const updateGuideSchema = insertGuideSchema.partial();

export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type UpdateGuide = z.infer<typeof updateGuideSchema>;
export type Guide = typeof guides.$inferSelect;

// Site settings table for managing global site configuration
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).notNull().default("Ontdek Polen"),
  siteDescription: text("site_description").notNull().default("Ontdek de mooiste plekken van Polen"),
  metaKeywords: text("meta_keywords").default("Polen, reizen, vakantie, bestemmingen"),
  favicon: varchar("favicon", { length: 255 }).default("/favicon.ico"),
  faviconEnabled: boolean("favicon_enabled").default(true),
  backgroundImage: varchar("background_image", { length: 255 }),
  backgroundImageAlt: varchar("background_image_alt", { length: 255 }),
  logoImage: varchar("logo_image", { length: 255 }),
  logoImageAlt: varchar("logo_image_alt", { length: 255 }),
  socialMediaImage: varchar("social_media_image", { length: 255 }),
  headerOverlayEnabled: boolean("header_overlay_enabled").default(false),
  headerOverlayOpacity: integer("header_overlay_opacity").default(30),
  customCSS: text("custom_css"),
  customJS: text("custom_js"),
  googleAnalyticsId: varchar("google_analytics_id", { length: 50 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).pick({
  siteName: true,
  siteDescription: true,
  metaKeywords: true,
  favicon: true,
  faviconEnabled: true,
  backgroundImage: true,
  backgroundImageAlt: true,
  logoImage: true,
  logoImageAlt: true,
  socialMediaImage: true,
  headerOverlayEnabled: true,
  headerOverlayOpacity: true,
  customCSS: true,
  customJS: true,
  googleAnalyticsId: true,
  isActive: true,
});

export const updateSiteSettingsSchema = insertSiteSettingsSchema.partial();

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

// Pages table for dynamic page management
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: varchar("meta_description", { length: 500 }),
  metaKeywords: varchar("meta_keywords", { length: 500 }),
  template: varchar("template", { length: 100 }).default("default").notNull(),
  headerImage: varchar("header_image", { length: 255 }), // Header image for the page
  headerImageAlt: varchar("header_image_alt", { length: 255 }), // Alt text for header image
  // Location-specific highlight sections (JSON array)
  highlightSections: text("highlight_sections"), // JSON string of highlight objects
  published: boolean("published").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  ranking: integer("ranking").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  is_deleted: boolean("is_deleted").default(false).notNull(),
  deleted_at: timestamp("deleted_at"),
});

export const insertPageSchema = createInsertSchema(pages).pick({
  title: true,
  slug: true,
  content: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  template: true,
  headerImage: true,
  headerImageAlt: true,
  highlightSections: true,
  published: true,
  featured: true,
  ranking: true,
});

export const updatePageSchema = insertPageSchema.partial();

export type InsertPage = z.infer<typeof insertPageSchema>;
export type UpdatePage = z.infer<typeof updatePageSchema>;
export type Page = typeof pages.$inferSelect;

// Templates table for reusable page templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  content: text("content").notNull(),
  defaultMetaTitle: varchar("default_meta_title", { length: 255 }),
  defaultMetaDescription: varchar("default_meta_description", { length: 500 }),
  defaultMetaKeywords: varchar("default_meta_keywords", { length: 500 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  name: true,
  description: true,
  content: true,
  defaultMetaTitle: true,
  defaultMetaDescription: true,
  defaultMetaKeywords: true,
  isActive: true,
});

export const updateTemplateSchema = insertTemplateSchema.partial();

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type UpdateTemplate = z.infer<typeof updateTemplateSchema>;
export type Template = typeof templates.$inferSelect;

// Highlights table
export const highlights = pgTable("highlights", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  iconPath: varchar("icon_path", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }).default("general"),
  ranking: integer("ranking").default(0),
  active: boolean("active").default(true),
  showOnHomepage: boolean("show_on_homepage").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertHighlightSchema = createInsertSchema(highlights).pick({
  name: true,
  iconPath: true,
  category: true,
  ranking: true,
  active: true,
  showOnHomepage: true,
});

export const updateHighlightSchema = insertHighlightSchema.partial();

export type InsertHighlight = z.infer<typeof insertHighlightSchema>;
export type UpdateHighlight = z.infer<typeof updateHighlightSchema>;
export type Highlight = typeof highlights.$inferSelect;

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }), // City/region where activity is located
  category: varchar("category", { length: 100 }), // museum, gebergte, plein, kerk, horeca, hotel, camping, etc.
  activityType: varchar("activitytype", { length: 100 }), // More specific type within category
  description: text("description"),
  image: text("image"),
  alt: text("alt"),
  content: text("content"),
  link: text("link"), // Optional link URL for the activity
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  ranking: integer("ranking").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  name: true,
  location: true,
  category: true,
  activityType: true,
  description: true,
  image: true,
  alt: true,
  content: true,
  link: true,
  featured: true,
  published: true,
  ranking: true,
});

export const updateActivitySchema = insertActivitySchema.partial();

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type UpdateActivity = z.infer<typeof updateActivitySchema>;
export type Activity = typeof activities.$inferSelect;

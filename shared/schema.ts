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
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  alt: text("alt").notNull(),
  content: text("content").notNull(),
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  ranking: integer("ranking").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
  is_deleted: boolean("is_deleted").default(false),
  deleted_at: timestamp("deleted_at"),
});

export const insertDestinationSchema = createInsertSchema(destinations).pick({
  name: true,
  slug: true,
  description: true,
  image: true,
  alt: true,
  content: true,
  featured: true,
  published: true,
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
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
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
  featured: true,
  published: true,
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
  backgroundImage: varchar("background_image", { length: 255 }),
  backgroundImageAlt: varchar("background_image_alt", { length: 255 }),
  logoImage: varchar("logo_image", { length: 255 }),
  logoImageAlt: varchar("logo_image_alt", { length: 255 }),
  socialMediaImage: varchar("social_media_image", { length: 255 }),
  customCSS: text("custom_css"),
  customJS: text("custom_js"),
  googleAnalyticsId: varchar("google_analytics_id", { length: 50 }),
  
  // Index/Home page specific SEO and content settings
  homePageTitle: varchar("home_page_title", { length: 60 }).default(""),
  homePageDescription: varchar("home_page_description", { length: 160 }).default(""),
  homePageKeywords: text("home_page_keywords").default(""),
  homeHeroTitle: varchar("home_hero_title", { length: 100 }).default("Ontdek Polen"),
  homeHeroSubtitle: varchar("home_hero_subtitle", { length: 200 }).default("Mooie plekken in Polen ontdekken"),
  homeCTATitle: varchar("home_cta_title", { length: 100 }).default("Laat je verrassen door het onbekende Polen"),
  homeCTADescription: text("home_cta_description").default("Bezoek historische steden, ontdek natuurparken en verborgen parels. Onze reisgidsen helpen je op weg!"),
  homeGuidesTitle: varchar("home_guides_title", { length: 100 }).default("Reisgidsen en Tips"),
  
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).pick({
  siteName: true,
  siteDescription: true,
  metaKeywords: true,
  favicon: true,
  backgroundImage: true,
  backgroundImageAlt: true,
  logoImage: true,
  logoImageAlt: true,
  socialMediaImage: true,
  customCSS: true,
  customJS: true,
  googleAnalyticsId: true,
  homePageTitle: true,
  homePageDescription: true,
  homePageKeywords: true,
  homeHeroTitle: true,
  homeHeroSubtitle: true,
  homeCTATitle: true,
  homeCTADescription: true,
  homeGuidesTitle: true,
  isActive: true,
});

export const updateSiteSettingsSchema = insertSiteSettingsSchema.partial();

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type UpdateSiteSettings = z.infer<typeof updateSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

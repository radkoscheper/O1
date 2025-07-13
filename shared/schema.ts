import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
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
  createdBy: true,
});

export const updateGuideSchema = insertGuideSchema.partial();

export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type UpdateGuide = z.infer<typeof updateGuideSchema>;
export type Guide = typeof guides.$inferSelect;

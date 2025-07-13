import { users, type User, type InsertUser, type UpdateUser } from "@shared/schema";
import { db } from "./db";
import { eq, ne } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: UpdateUser): Promise<User>;
  updateUserPassword(id: number, newPassword: string): Promise<void>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getAllUsersExcept(userId: number): Promise<User[]>;
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
}

export const storage = new DatabaseStorage();

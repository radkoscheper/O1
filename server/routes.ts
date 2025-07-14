import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { sql } from "drizzle-orm";
import session from "express-session";
import bcrypt from "bcrypt";
import { z } from "zod";
import { insertUserSchema, updateUserSchema, changePasswordSchema, resetPasswordSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

declare module "express-session" {
  interface SessionData {
    userId?: number;
    isAuthenticated?: boolean;
  }
}

// Middleware to check if user is authenticated
const requireAuth = (req: any, res: any, next: any) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'client', 'public', 'images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate temporary filename first
    const tempName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, tempName);
  }
});

const upload = multer({ 
  storage: storage_config,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: 'your-secret-key', // In production, use environment variable
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.isAuthenticated = true;
      
      res.json({ message: "Login successful", user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Logout route
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Check auth status and get current user info
  app.get("/api/auth/status", async (req, res) => {
    if (req.session.isAuthenticated && req.session.userId) {
      try {
        const user = await storage.getUser(req.session.userId);
        if (user) {
          // Don't send password in response
          const { password, ...userWithoutPassword } = user;
          res.json({ isAuthenticated: true, user: userWithoutPassword });
        } else {
          res.json({ isAuthenticated: false });
        }
      } catch (error) {
        res.json({ isAuthenticated: false });
      }
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Image upload route with error handling
  app.post("/api/upload", requireAuth, (req, res) => {
    console.log("Upload route hit by user:", req.session.userId);
    
    upload.single('image')(req, res, async (err) => {
      if (err) {
        console.error("Multer error:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: "Bestand te groot. Maximum 5MB toegestaan."
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "Upload fout"
        });
      }

      if (!req.file) {
        console.log("No file received");
        return res.status(400).json({ 
          success: false, 
          message: "Geen afbeelding geüpload of alleen afbeeldingen zijn toegestaan" 
        });
      }

      console.log("File uploaded:", req.file.filename);
      console.log("Request body after multer:", req.body);
      
      let finalFileName = req.file.filename;
      
      // Check if custom filename was provided and rename file
      if (req.body.fileName && req.body.fileName.trim()) {
        const customName = req.body.fileName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const newFileName = customName + path.extname(req.file.originalname);
        const oldPath = path.join(uploadsDir, req.file.filename);
        const newPath = path.join(uploadsDir, newFileName);
        
        // Create trash directory if it doesn't exist
        const trashDir = path.join(uploadsDir, '.trash');
        if (!fs.existsSync(trashDir)) {
          fs.mkdirSync(trashDir, { recursive: true });
        }
        
        try {
          // Check if ANY file with the same base name already exists (regardless of extension)
          const existingFiles = fs.readdirSync(uploadsDir).filter(file => {
            const baseName = path.parse(file).name;
            return baseName === customName && !file.startsWith('.') && file !== req.file!.filename;
          });
          
          if (existingFiles.length > 0) {
            // Move the first matching existing file to trash
            const existingFile = existingFiles[0];
            const existingPath = path.join(uploadsDir, existingFile);
            const timestamp = Date.now();
            const existingExt = path.extname(existingFile);
            const trashFileName = `${customName}-backup-${timestamp}${existingExt}`;
            const trashPath = path.join(trashDir, trashFileName);
            
            fs.renameSync(existingPath, trashPath);
            console.log("Existing file moved to trash:", trashFileName);
            
            // Log this action for potential recovery
            const logEntry = {
              originalName: existingFile,
              trashName: trashFileName,
              movedAt: new Date().toISOString(),
              canRestore: true
            };
            
            const logPath = path.join(trashDir, 'trash.log');
            const logData = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '[]';
            const logs = JSON.parse(logData || '[]');
            logs.push(logEntry);
            fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
          }
          
          // Rename new file to custom name
          fs.renameSync(oldPath, newPath);
          finalFileName = newFileName;
          console.log("File renamed to:", finalFileName);
        } catch (renameError) {
          console.error("Error renaming file:", renameError);
          // Continue with original filename if rename fails
        }
      }
      
      // Return the path that can be used in the frontend
      const imagePath = `/images/${finalFileName}`;
      
      res.json({
        success: true,
        message: "Afbeelding succesvol geüpload",
        imagePath: imagePath,
        fileName: finalFileName
      });
    });
  });

  // Create admin user (for initial setup)
  app.post("/api/setup-admin", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const { username, password } = validation.data as { username: string; password: string };
      
      // Check if admin already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ username, password: hashedPassword });
      
      res.json({ message: "Admin user created", user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Middleware to check if user can manage users
  const requireUserManagement = async (req: any, res: any, next: any) => {
    if (!req.session.isAuthenticated || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.canManageUsers) {
      return res.status(403).json({ message: "Geen toestemming voor gebruikersbeheer" });
    }
    
    req.currentUser = user;
    next();
  };

  // USER MANAGEMENT ROUTES

  // Get all users (admin only)
  app.get("/api/users", requireUserManagement, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create new user (admin only)
  app.post("/api/users", requireUserManagement, async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const { username, password, ...permissions } = validation.data as any;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Gebruikersnaam bestaat al" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        createdBy: (req as any).currentUser.id,
        ...permissions
      });
      
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ message: "Gebruiker aangemaakt", user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update user (admin only)
  app.put("/api/users/:id", requireUserManagement, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const validation = updateUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      // Don't allow updating your own admin status
      if (userId === (req as any).currentUser.id && validation.data.canManageUsers === false) {
        return res.status(400).json({ message: "Je kunt je eigen admin rechten niet intrekken" });
      }

      const updatedUser = await storage.updateUser(userId, validation.data);
      const { password, ...userWithoutPassword } = updatedUser;
      res.json({ message: "Gebruiker bijgewerkt", user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reset user password (admin only)
  app.post("/api/users/:id/reset-password", requireUserManagement, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const validation = z.object({
        newPassword: z.string().min(6),
        confirmPassword: z.string().min(1)
      }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Wachtwoorden komen niet overeen",
        path: ["confirmPassword"],
      }).safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const hashedPassword = await bcrypt.hash(validation.data.newPassword, 10);
      await storage.updateUserPassword(userId, hashedPassword);
      
      res.json({ message: "Wachtwoord gereset" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", requireUserManagement, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Don't allow deleting yourself
      if (userId === (req as any).currentUser.id) {
        return res.status(400).json({ message: "Je kunt jezelf niet verwijderen" });
      }

      await storage.deleteUser(userId);
      res.json({ message: "Gebruiker verwijderd" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Change own password (any authenticated user)
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const validation = changePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "Gebruiker niet gevonden" });
      }

      // Verify current password
      const isValidCurrentPassword = await bcrypt.compare(validation.data.currentPassword, user.password);
      if (!isValidCurrentPassword) {
        return res.status(400).json({ message: "Huidig wachtwoord is onjuist" });
      }

      const hashedNewPassword = await bcrypt.hash(validation.data.newPassword, 10);
      await storage.updateUserPassword(user.id, hashedNewPassword);
      
      res.json({ message: "Wachtwoord succesvol gewijzigd" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // DESTINATIONS API ENDPOINTS
  
  // Get all destinations
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getPublishedDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all active destinations for admin
  app.get("/api/admin/destinations", requireAuth, async (req, res) => {
    try {
      const destinations = await storage.getAllDestinations();
      // Filter out soft-deleted destinations
      const activeDestinations = destinations.filter(dest => !dest.is_deleted);
      res.json(activeDestinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create destination
  app.post("/api/destinations", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om content te maken" });
      }

      const validation = z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        image: z.string().min(1),
        alt: z.string().min(1),
        content: z.string().min(1),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        ranking: z.number().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const { name, description, image, alt, content, featured = false, published = true, ranking = 0 } = validation.data;
      
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const destination = await storage.createDestination({
        name,
        slug,
        description,
        image,
        alt,
        content,
        featured,
        published,
        ranking,
        createdBy: user.id,
      });

      res.json(destination);
    } catch (error) {
      console.error("Error creating destination:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update destination
  app.put("/api/destinations/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bewerken" });
      }

      const id = parseInt(req.params.id);
      const validation = z.object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        image: z.string().min(1).optional(),
        alt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        ranking: z.number().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const updates: any = validation.data;
      
      // Update slug if name changes
      if (updates.name) {
        updates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      }

      const destination = await storage.updateDestination(id, updates);
      res.json(destination);
    } catch (error) {
      console.error("Error updating destination:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete destination
  app.delete("/api/destinations/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om content te verwijderen" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteDestination(id);
      res.json({ message: "Destination verwijderd" });
    } catch (error) {
      console.error("Error deleting destination:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Soft delete destination (move to recycle bin)
  app.patch("/api/destinations/:id/soft-delete", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om content te verwijderen" });
      }

      const id = parseInt(req.params.id);
      await db.execute(sql`UPDATE destinations SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() WHERE id = ${id}`);
      res.json({ message: "Bestemming naar prullenbak verplaatst" });
    } catch (error) {
      console.error("Soft delete destination error:", error);
      res.status(500).json({ message: "Fout bij verplaatsen naar prullenbak" });
    }
  });

  // Restore destination from recycle bin
  app.patch("/api/destinations/:id/restore", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bewerken" });
      }

      const id = parseInt(req.params.id);
      await db.execute(sql`UPDATE destinations SET is_deleted = FALSE, deleted_at = NULL, updated_at = NOW() WHERE id = ${id}`);
      const result = await db.execute(sql`SELECT * FROM destinations WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Restore destination error:", error);
      res.status(500).json({ message: "Fout bij herstellen bestemming" });
    }
  });

  // Get deleted destinations (recycle bin)
  app.get("/api/admin/destinations/deleted", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bekijken" });
      }

      const result = await db.execute(sql`SELECT * FROM destinations WHERE is_deleted = TRUE ORDER BY deleted_at DESC`);
      res.json(result.rows);
    } catch (error) {
      console.error("Get deleted destinations error:", error);
      res.status(500).json({ message: "Fout bij ophalen verwijderde bestemmingen" });
    }
  });

  // GUIDES API ENDPOINTS
  
  // Get all guides
  app.get("/api/guides", async (req, res) => {
    try {
      const guides = await storage.getPublishedGuides();
      res.json(guides);
    } catch (error) {
      console.error("Error fetching guides:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all active guides for admin
  app.get("/api/admin/guides", requireAuth, async (req, res) => {
    try {
      const guides = await storage.getAllGuides();
      // Filter out soft-deleted guides
      const activeGuides = guides.filter(guide => !guide.is_deleted);
      res.json(activeGuides);
    } catch (error) {
      console.error("Error fetching guides:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create guide
  app.post("/api/guides", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om content te maken" });
      }

      const validation = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        image: z.string().min(1),
        alt: z.string().min(1),
        content: z.string().min(1),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        ranking: z.number().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const { title, description, image, alt, content, featured = false, published = true, ranking = 0 } = validation.data;
      
      // Generate slug from title
      const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const guide = await storage.createGuide({
        title,
        slug,
        description,
        image,
        alt,
        content,
        featured,
        published,
        ranking,
        createdBy: user.id,
      });

      res.json(guide);
    } catch (error) {
      console.error("Error creating guide:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update guide
  app.put("/api/guides/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bewerken" });
      }

      const id = parseInt(req.params.id);
      const validation = z.object({
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        image: z.string().min(1).optional(),
        alt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        ranking: z.number().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const updates: any = validation.data;
      
      // Update slug if title changes
      if (updates.title) {
        updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      }

      const guide = await storage.updateGuide(id, updates);
      res.json(guide);
    } catch (error) {
      console.error("Error updating guide:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete guide
  app.delete("/api/guides/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om content te verwijderen" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteGuide(id);
      res.json({ message: "Guide verwijderd" });
    } catch (error) {
      console.error("Error deleting guide:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Soft delete guide (move to recycle bin)
  app.patch("/api/guides/:id/soft-delete", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om content te verwijderen" });
      }

      const id = parseInt(req.params.id);
      await db.execute(sql`UPDATE guides SET is_deleted = TRUE, deleted_at = NOW(), updated_at = NOW() WHERE id = ${id}`);
      res.json({ message: "Reisgids naar prullenbak verplaatst" });
    } catch (error) {
      console.error("Soft delete guide error:", error);
      res.status(500).json({ message: "Fout bij verplaatsen naar prullenbak" });
    }
  });

  // Restore guide from recycle bin
  app.patch("/api/guides/:id/restore", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bewerken" });
      }

      const id = parseInt(req.params.id);
      await db.execute(sql`UPDATE guides SET is_deleted = FALSE, deleted_at = NULL, updated_at = NOW() WHERE id = ${id}`);
      const result = await db.execute(sql`SELECT * FROM guides WHERE id = ${id}`);
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Restore guide error:", error);
      res.status(500).json({ message: "Fout bij herstellen reisgids" });
    }
  });

  // Get deleted guides (recycle bin)
  app.get("/api/admin/guides/deleted", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bekijken" });
      }

      const result = await db.execute(sql`SELECT * FROM guides WHERE is_deleted = TRUE ORDER BY deleted_at DESC`);
      res.json(result.rows);
    } catch (error) {
      console.error("Get deleted guides error:", error);
      res.status(500).json({ message: "Fout bij ophalen verwijderde reisgidsen" });
    }
  });

  // Get trashed images
  app.get("/api/admin/images/trash", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || (!user.canDeleteContent && !user.canEditContent)) {
        return res.status(403).json({ message: "Geen toestemming om verwijderde afbeeldingen te bekijken" });
      }

      const trashDir = path.join(uploadsDir, '.trash');
      const logPath = path.join(trashDir, 'trash.log');
      
      if (!fs.existsSync(logPath)) {
        return res.json([]);
      }
      
      const logData = fs.readFileSync(logPath, 'utf8');
      const trashedImages = JSON.parse(logData || '[]');
      
      res.json(trashedImages);
    } catch (error) {
      console.error("Error getting trashed images:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Restore trashed image
  app.post("/api/admin/images/restore", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om afbeeldingen te herstellen" });
      }

      const { trashName, originalName } = req.body;
      const trashDir = path.join(uploadsDir, '.trash');
      const trashPath = path.join(trashDir, trashName);
      const currentPath = path.join(uploadsDir, originalName);
      
      if (!fs.existsSync(trashPath)) {
        return res.status(404).json({ message: "Afbeelding niet gevonden in prullenbak" });
      }
      
      // If current file exists, move it to trash first
      if (fs.existsSync(currentPath)) {
        const timestamp = Date.now();
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        const newTrashName = `${baseName}-replaced-${timestamp}${ext}`;
        const newTrashPath = path.join(trashDir, newTrashName);
        
        // Move current file to trash
        fs.renameSync(currentPath, newTrashPath);
        
        // Add to trash log
        const logPath = path.join(trashDir, 'trash.log');
        const logData = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '[]';
        const logs = JSON.parse(logData || '[]');
        
        const newLogEntry = {
          originalName: originalName,
          trashName: newTrashName,
          movedAt: new Date().toISOString(),
          canRestore: true,
          reason: "Replaced during restore"
        };
        
        logs.push(newLogEntry);
        fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
        
        console.log(`Current file moved to trash: ${newTrashName}`);
      }
      
      // Restore the trashed file to original location
      fs.renameSync(trashPath, currentPath);
      
      // Remove from trash log
      const logPath = path.join(trashDir, 'trash.log');
      const logData = fs.readFileSync(logPath, 'utf8');
      const logs = JSON.parse(logData || '[]');
      const updatedLogs = logs.filter((log: any) => log.trashName !== trashName);
      fs.writeFileSync(logPath, JSON.stringify(updatedLogs, null, 2));
      
      console.log(`File restored to original location: ${originalName}`);
      
      res.json({ 
        message: "Afbeelding succesvol hersteld",
        restoredAs: originalName
      });
    } catch (error) {
      console.error("Error restoring image:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Permanently delete trashed image
  app.delete("/api/admin/images/trash/:trashName", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om afbeeldingen permanent te verwijderen" });
      }

      const { trashName } = req.params;
      const trashDir = path.join(uploadsDir, '.trash');
      const trashPath = path.join(trashDir, trashName);
      
      if (!fs.existsSync(trashPath)) {
        return res.status(404).json({ message: "Afbeelding niet gevonden in prullenbak" });
      }
      
      // Get the original name from trash log to check if there's a file in main images folder
      const logPath = path.join(trashDir, 'trash.log');
      const logData = fs.readFileSync(logPath, 'utf8');
      const logs = JSON.parse(logData || '[]');
      const logEntry = logs.find((log: any) => log.trashName === trashName);
      
      // Delete file from trash
      fs.unlinkSync(trashPath);
      console.log(`Trashed file deleted: ${trashName}`);
      
      // If we found the log entry, also check and delete from main images folder
      if (logEntry && logEntry.originalName) {
        const mainImagePath = path.join(uploadsDir, logEntry.originalName);
        if (fs.existsSync(mainImagePath)) {
          fs.unlinkSync(mainImagePath);
          console.log(`Main image file also deleted: ${logEntry.originalName}`);
        }
      }
      
      // Update trash log
      const updatedLogs = logs.filter((log: any) => log.trashName !== trashName);
      fs.writeFileSync(logPath, JSON.stringify(updatedLogs, null, 2));
      
      res.json({ message: "Afbeelding permanent verwijderd uit prullenbak en images map" });
    } catch (error) {
      console.error("Error permanently deleting image:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

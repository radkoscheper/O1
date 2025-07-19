import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
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

// Unified upload configuration for all file types
const createUploadConfig = (uploadType: 'image' | 'favicon') => {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        if (uploadType === 'favicon') {
          cb(null, path.join(process.cwd(), 'client', 'public'));
        } else {
          // Use destination from form data if provided, otherwise use default
          const destination = req.body.destination;
          const entityId = req.body.entityId;
          const entityName = req.body.entityName;
          
          if (destination && ['background', 'logo', 'social'].includes(destination)) {
            // Map imageType to actual folder names (handle plural forms)
            const folderMap = {
              background: 'backgrounds',
              logo: 'logo', 
              social: 'social'
            };
            const actualFolder = folderMap[destination as keyof typeof folderMap];
            const destDir = path.join(process.cwd(), 'client', 'public', 'images', actualFolder);
            // Create directory if it doesn't exist
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            cb(null, destDir);
          } else if (destination === 'activities' && entityId && entityName) {
            // Create specific folder for each activity
            const sanitizedName = entityName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const activityFolder = `${entityId}-${sanitizedName}`;
            const destDir = path.join(process.cwd(), 'client', 'public', 'images', 'activities', activityFolder);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            cb(null, destDir);
          } else if (destination === 'destinations' && entityId && entityName) {
            // Create specific folder for each destination
            const sanitizedName = entityName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
            const destinationFolder = `${entityId}-${sanitizedName}`;
            const destDir = path.join(process.cwd(), 'client', 'public', 'images', 'destinations', destinationFolder);
            if (!fs.existsSync(destDir)) {
              fs.mkdirSync(destDir, { recursive: true });
            }
            cb(null, destDir);
          } else {
            cb(null, uploadsDir); // Default fallback
          }
        }
      },
      filename: function (req, file, cb) {
        if (uploadType === 'favicon') {
          const customName = req.body.fileName || 'favicon';
          cb(null, `${customName}.ico`);
        } else {
          const customName = req.body.fileName || `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
          const fileExtension = path.extname(file.originalname);
          cb(null, `${customName}${fileExtension}`);
        }
      }
    }),
    limits: {
      fileSize: uploadType === 'favicon' ? 1024 * 1024 : 5 * 1024 * 1024 // 1MB voor favicon, 5MB voor images
    },
    fileFilter: function (req, file, cb) {
      if (uploadType === 'favicon') {
        if (file.mimetype === 'image/x-icon' || file.originalname.toLowerCase().endsWith('.ico')) {
          cb(null, true);
        } else {
          cb(new Error('Only .ico files are allowed for favicon upload'));
        }
      } else {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      }
    }
  });
};

const upload = createUploadConfig('image');
const faviconUpload = createUploadConfig('favicon');

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure PostgreSQL session store
  const PgStore = connectPgSimple(session);
  
  // Session middleware with PostgreSQL storage
  app.use(session({
    store: new PgStore({
      pool: pool,
      createTableIfMissing: true,
      tableName: 'user_sessions', // Use custom table name to avoid conflicts
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key', // In production, use environment variable
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
      
      // Bepaal de juiste directory gebaseerd op destination en entity info
      let finalDirectory = uploadsDir;
      let relativePath = '';
      
      if (req.body?.destination === 'activities' && req.body?.entityId && req.body?.entityName) {
        // Create specific folder for each activity
        const sanitizedName = req.body.entityName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const activityFolder = `${req.body.entityId}-${sanitizedName}`;
        finalDirectory = path.join(process.cwd(), 'client', 'public', 'images', 'activities', activityFolder);
        relativePath = `/images/activities/${activityFolder}`;
        if (!fs.existsSync(finalDirectory)) {
          fs.mkdirSync(finalDirectory, { recursive: true });
        }
      } else if (req.body?.destination === 'destinations' && req.body?.entityId && req.body?.entityName) {
        // Create specific folder for each destination
        const sanitizedName = req.body.entityName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const destinationFolder = `${req.body.entityId}-${sanitizedName}`;
        finalDirectory = path.join(process.cwd(), 'client', 'public', 'images', 'destinations', destinationFolder);
        relativePath = `/images/destinations/${destinationFolder}`;
        if (!fs.existsSync(finalDirectory)) {
          fs.mkdirSync(finalDirectory, { recursive: true });
        }
      } else if (req.body?.destination && ['background', 'logo', 'social', 'destinations', 'guides'].includes(req.body.destination)) {
        // Map imageType to actual folder names (handle plural forms)
        const folderMap = {
          background: 'backgrounds',
          logo: 'logo', 
          social: 'social',
          destinations: 'destinations',
          guides: 'guides'
        };
        const actualFolder = folderMap[req.body.destination as keyof typeof folderMap];
        finalDirectory = path.join(process.cwd(), 'client', 'public', 'images', actualFolder);
        relativePath = `/images/${actualFolder}`;
        if (!fs.existsSync(finalDirectory)) {
          fs.mkdirSync(finalDirectory, { recursive: true });
        }
      } else if (req.body?.destination) {
        finalDirectory = path.join(uploadsDir, 'headers', req.body.destination);
        relativePath = `/images/headers/${req.body.destination}`;
        if (!fs.existsSync(finalDirectory)) {
          fs.mkdirSync(finalDirectory, { recursive: true });
        }
      }
      
      // Check if custom filename was provided and rename file
      if (req.body.fileName && req.body.fileName.trim()) {
        const customName = req.body.fileName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        // Voor gecroppte afbeeldingen, altijd .jpg gebruiken
        const newFileName = customName + '.jpg';
        
        const oldPath = req.file.path;
        const newPath = path.join(finalDirectory, newFileName);
        
        // Create trash directory if it doesn't exist
        const trashDir = path.join(uploadsDir, '.trash');
        if (!fs.existsSync(trashDir)) {
          fs.mkdirSync(trashDir, { recursive: true });
        }
        
        try {
          // Check if ANY file with the same base name already exists (regardless of extension)
          const existingFiles = fs.readdirSync(finalDirectory).filter(file => {
            const baseName = path.parse(file).name;
            return baseName === customName && !file.startsWith('.') && file !== req.file!.filename;
          });
          
          if (existingFiles.length > 0) {
            // Move ALL matching existing files to archive before new upload
            existingFiles.forEach(existingFile => {
              const existingPath = path.join(finalDirectory, existingFile);
              const timestamp = Date.now();
              const existingExt = path.extname(existingFile);
              const archiveFileName = `${customName}-archived-${timestamp}${existingExt}`;
              const archivePath = path.join(trashDir, archiveFileName);
              
              fs.renameSync(existingPath, archivePath);
              console.log("Existing file archived before upload:", archiveFileName);
              
              // Log this action for potential recovery
              const logEntry = {
                originalName: existingFile,
                trashName: archiveFileName,
                movedAt: new Date().toISOString(),
                canRestore: true,
                reason: "Auto-archived before new upload"
              };
              
              const logPath = path.join(trashDir, 'trash.log');
              const logData = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : '[]';
              const logs = JSON.parse(logData || '[]');
              logs.push(logEntry);
              fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
            });
          }
          
          // Rename new file to custom name
          fs.renameSync(oldPath, newPath);
          finalFileName = newFileName;
          console.log("File renamed to:", finalFileName);
        } catch (renameError) {
          console.error("Error renaming file:", renameError);
          // Continue with original filename if rename fails
        }
      } else {
        // Geen custom filename, verplaats naar juiste directory
        const oldPath = req.file.path;
        const newPath = path.join(finalDirectory, req.file.filename);
        fs.renameSync(oldPath, newPath);
      }
      
      // Calculate the correct path based on destination and entity info
      let imagePath = `/images/${finalFileName}`;
      if (relativePath) {
        // Use the relative path calculated earlier for activities/destinations with entity folders
        imagePath = `${relativePath}/${finalFileName}`;
      } else if (req.body?.destination && ['background', 'logo', 'social', 'destinations', 'guides'].includes(req.body.destination)) {
        // Map imageType to actual folder names (handle plural forms)
        const folderMap = {
          background: 'backgrounds',
          logo: 'logo', 
          social: 'social',
          destinations: 'destinations',
          guides: 'guides'
        };
        const actualFolder = folderMap[req.body.destination as keyof typeof folderMap];
        imagePath = `/images/${actualFolder}/${finalFileName}`;
      } else if (req.body?.destination) {
        imagePath = `/images/headers/${req.body.destination}/${finalFileName}`;
      }
      
      res.json({
        success: true,
        message: "Afbeelding succesvol geüpload",
        path: imagePath,
        imagePath: imagePath,
        fileName: finalFileName
      });
    });
  });

  // Delete image endpoint
  app.post("/api/admin/images/delete", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om afbeeldingen te verwijderen" });
      }

      const { imagePath } = req.body;
      if (!imagePath) {
        return res.status(400).json({ message: "Geen afbeelding pad opgegeven" });
      }

      // Convert web path to file system path
      const filePath = path.join(process.cwd(), 'client', 'public', imagePath);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Afbeelding niet gevonden" });
      }

      // Create trash directory if it doesn't exist
      const trashDir = path.join(uploadsDir, '.trash');
      if (!fs.existsSync(trashDir)) {
        fs.mkdirSync(trashDir, { recursive: true });
      }

      // Move file to trash instead of deleting
      const fileName = path.basename(filePath);
      const timestamp = Date.now();
      const trashFileName = `${timestamp}-${fileName}`;
      const trashPath = path.join(trashDir, trashFileName);

      fs.renameSync(filePath, trashPath);
      
      console.log(`Image moved to trash: ${fileName} -> ${trashFileName}`);
      
      res.json({ 
        success: true, 
        message: "Afbeelding succesvol verwijderd",
        trashedAs: trashFileName 
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Server error bij verwijderen afbeelding" });
    }
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

  // Get homepage destinations (only those with showOnHomepage = true)
  app.get("/api/destinations/homepage", async (req, res) => {
    try {
      const destinations = await storage.getHomepageDestinations();
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching homepage destinations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all active destinations for admin
  app.get("/api/admin/destinations", requireAuth, async (req, res) => {
    try {
      console.log("Fetching destinations for admin user:", req.session.userId);
      const destinations = await storage.getActiveDestinations();
      console.log("Found destinations:", destinations.length);
      console.log("First few destinations:", destinations.slice(0, 3).map(d => ({id: d.id, name: d.name})));
      // Prevent aggressive caching for admin endpoints
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json(destinations);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create destination
  app.post("/api/destinations", requireAuth, async (req, res) => {
    console.log("CREATE DESTINATION - Request body:", req.body);
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om content te maken" });
      }

      const validation = z.object({
        name: z.string().min(1),
        location: z.string().optional(),
        description: z.string().min(1),
        image: z.string().min(1),
        alt: z.string().min(1),
        content: z.string().min(1),
        link: z.string().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        showOnHomepage: z.boolean().optional(),
        ranking: z.number().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const { name, location, description, image, alt, content, link, featured = false, published = true, showOnHomepage = true, ranking = 0 } = validation.data;
      
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const destination = await storage.createDestination({
        name,
        location,
        slug,
        description,
        image,
        alt,
        content,
        link,
        featured,
        published,
        showOnHomepage,
        ranking,
        createdBy: user.id,
      });

      res.json(destination);
    } catch (error) {
      console.error("Error creating destination:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create destination for admin (admin-specific endpoint)
  app.post("/api/admin/destinations", requireAuth, async (req, res) => {
    console.log("CREATE ADMIN DESTINATION - Request body:", req.body);
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om content te maken" });
      }

      const validation = z.object({
        name: z.string().min(1),
        location: z.string().optional(),
        description: z.string().min(1),
        image: z.string().min(1),
        alt: z.string().min(1),
        content: z.string().min(1),
        link: z.string().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        showOnHomepage: z.boolean().optional(),
        ranking: z.number().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        console.log("Validation failed:", validation.error.errors);
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const { name, location, description, image, alt, content, link, featured = false, published = true, showOnHomepage = true, ranking = 0 } = validation.data;
      
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const destination = await storage.createDestination({
        name,
        location,
        slug,
        description,
        image,
        alt,
        content,
        link,
        featured,
        published,
        showOnHomepage,
        ranking,
        createdBy: user.id,
      });

      console.log("Created destination:", destination.id, destination.name);
      res.json(destination);
    } catch (error) {
      console.error("Error creating admin destination:", error);
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
        location: z.string().optional(),
        description: z.string().min(1).optional(),
        image: z.string().min(1).optional(),
        alt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        link: z.string().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        showOnHomepage: z.boolean().optional(),
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
      
      // Get destination data before deletion to clean up associated files
      const destination = await storage.getDestination(id);
      
      // Delete destination from database
      await storage.deleteDestination(id);
      
      // Clean up associated image files
      if (destination && destination.image) {
        try {
          const imagePath = path.join(process.cwd(), 'client', 'public', destination.image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`Deleted destination image: ${destination.image}`);
          }
        } catch (fileError) {
          console.error(`Error deleting destination image ${destination.image}:`, fileError);
          // Don't fail the whole operation if file deletion fails
        }
      }
      
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

  // Get homepage guides (only those with showOnHomepage = true)
  app.get("/api/guides/homepage", async (req, res) => {
    try {
      const guides = await storage.getHomepageGuides();
      res.json(guides);
    } catch (error) {
      console.error("Error fetching homepage guides:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all active guides for admin
  app.get("/api/admin/guides", requireAuth, async (req, res) => {
    try {
      const guides = await storage.getActiveGuides();
      // Prevent aggressive caching for admin endpoints
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json(guides);
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
        link: z.string().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        showOnHomepage: z.boolean().optional(),
        ranking: z.number().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const { title, description, image, alt, content, link, featured = false, published = true, showOnHomepage = true, ranking = 0 } = validation.data;
      
      // Generate slug from title
      const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      
      const guide = await storage.createGuide({
        title,
        slug,
        description,
        image,
        alt,
        content,
        link,
        featured,
        published,
        showOnHomepage,
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
        link: z.string().optional(),
        featured: z.boolean().optional(),
        published: z.boolean().optional(),
        showOnHomepage: z.boolean().optional(),
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
      
      // Get guide data before deletion to clean up associated files
      const guide = await storage.getGuide(id);
      
      // Delete guide from database
      await storage.deleteGuide(id);
      
      // Clean up associated image files
      if (guide && guide.image) {
        try {
          const imagePath = path.join(process.cwd(), 'client', 'public', guide.image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`Deleted guide image: ${guide.image}`);
          }
        } catch (fileError) {
          console.error(`Error deleting guide image ${guide.image}:`, fileError);
          // Don't fail the whole operation if file deletion fails
        }
      }
      
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

  // Site settings routes (public - no auth required)
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      if (!settings) {
        // Create default settings if none exist
        const newSettings = await storage.createDefaultSiteSettings();
        return res.json(newSettings);
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/admin/site-settings", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Alleen admins kunnen site-instellingen wijzigen" });
      }

      const updates = req.body;
      const updatedSettings = await storage.updateSiteSettings(updates);
      
      res.json(updatedSettings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // HEADER IMAGES ROUTES

  // Get available header images for a destination/page
  app.get("/api/admin/header-images/:destination", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || (!user.canEditContent && !user.canCreateContent)) {
        return res.status(403).json({ message: "Geen toestemming om header afbeeldingen te bekijken" });
      }

      const { destination } = req.params;
      const headersDir = path.join(process.cwd(), 'client/public/images/headers', destination);
      
      if (!fs.existsSync(headersDir)) {
        return res.json([]);
      }

      const files = fs.readdirSync(headersDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
      );

      const headerImages = imageFiles.map(file => ({
        filename: file,
        path: `/images/headers/${destination}/${file}`,
        name: file.replace(/\.[^/.]+$/, "").replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
      }));

      res.json(headerImages);
    } catch (error) {
      console.error("Error fetching header images:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // PAGES ROUTES

  // Get all pages (admin) - PUT ADMIN ROUTES FIRST
  app.get("/api/admin/pages", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || (!user.canEditContent && !user.canCreateContent)) {
        return res.status(403).json({ message: "Geen toestemming om pagina's te bekijken" });
      }

      const pages = await storage.getAllPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get deleted pages (admin) - PUT BEFORE SPECIFIC PAGE ROUTE
  app.get("/api/admin/pages/deleted", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || (!user.canEditContent && !user.canDeleteContent)) {
        return res.status(403).json({ message: "Geen toestemming om verwijderde pagina's te bekijken" });
      }

      const pages = await storage.getDeletedPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching deleted pages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get single page (admin)
  app.get("/api/admin/pages/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || (!user.canEditContent && !user.canCreateContent)) {
        return res.status(403).json({ message: "Geen toestemming om pagina's te bekijken" });
      }

      const { id } = req.params;
      const pageId = parseInt(id);
      if (isNaN(pageId)) {
        return res.status(400).json({ message: "Invalid page ID" });
      }
      const page = await storage.getPage(pageId);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create page
  app.post("/api/admin/pages", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om pagina's aan te maken" });
      }

      const pageData = { ...req.body, createdBy: user.id };
      const page = await storage.createPage(pageData);
      res.json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update page
  app.put("/api/admin/pages/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om pagina's te bewerken" });
      }

      const { id } = req.params;
      const page = await storage.updatePage(parseInt(id), req.body);
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Toggle page homepage visibility
  app.patch("/api/admin/pages/:id/homepage", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om pagina's te bewerken" });
      }

      const { id } = req.params;
      const { published } = req.body;
      
      if (typeof published !== 'boolean') {
        return res.status(400).json({ message: "Published waarde moet boolean zijn" });
      }

      const page = await storage.updatePage(parseInt(id), { published });
      res.json(page);
    } catch (error) {
      console.error("Error toggling page homepage:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Toggle destination homepage visibility
  app.patch("/api/admin/destinations/:id/homepage", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om bestemmingen te bewerken" });
      }

      const { id } = req.params;
      const { showOnHomepage } = req.body;
      
      if (typeof showOnHomepage !== 'boolean') {
        return res.status(400).json({ message: "showOnHomepage waarde moet boolean zijn" });
      }

      const destination = await storage.updateDestination(parseInt(id), { showOnHomepage });
      res.json(destination);
    } catch (error) {
      console.error("Error toggling destination homepage:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Toggle guide homepage visibility
  app.patch("/api/admin/guides/:id/homepage", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om reisgidsen te bewerken" });
      }

      const { id } = req.params;
      const { showOnHomepage } = req.body;
      
      if (typeof showOnHomepage !== 'boolean') {
        return res.status(400).json({ message: "showOnHomepage waarde moet boolean zijn" });
      }

      const guide = await storage.updateGuide(parseInt(id), { showOnHomepage });
      res.json(guide);
    } catch (error) {
      console.error("Error toggling guide homepage:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Soft delete page
  app.patch("/api/admin/pages/:id/soft-delete", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om pagina's te verwijderen" });
      }

      const { id } = req.params;
      await storage.softDeletePage(parseInt(id));
      res.json({ message: "Pagina naar prullenbak verplaatst" });
    } catch (error) {
      console.error("Error soft deleting page:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Restore page
  app.patch("/api/admin/pages/:id/restore", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om pagina's te herstellen" });
      }

      const { id } = req.params;
      const page = await storage.restorePage(parseInt(id));
      res.json(page);
    } catch (error) {
      console.error("Error restoring page:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Permanently delete page
  app.delete("/api/admin/pages/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om pagina's definitief te verwijderen" });
      }

      const { id } = req.params;
      await storage.deletePage(parseInt(id));
      res.json({ message: "Pagina definitief verwijderd" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // PUBLIC PAGES ROUTES - ADD THESE AFTER ADMIN ROUTES

  // Get all published pages (public)
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getPublishedPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get page by slug (public)
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getPageBySlug(slug);
      
      if (!page || !page.published || page.is_deleted) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // TEMPLATES ROUTES

  // Get all active templates (for page creation)
  app.get("/api/templates", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || (!user.canCreateContent && !user.canEditContent)) {
        return res.status(403).json({ message: "Geen toestemming om templates te bekijken" });
      }

      const templates = await storage.getActiveTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get all templates (admin)
  app.get("/api/admin/templates", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Alleen admins kunnen templates beheren" });
      }

      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create template (admin)
  app.post("/api/admin/templates", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Alleen admins kunnen templates aanmaken" });
      }

      const templateData = { ...req.body, createdBy: user.id };
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error) {
      console.error("Error creating template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update template (admin)
  app.patch("/api/admin/templates/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Alleen admins kunnen templates bewerken" });
      }

      const { id } = req.params;
      const template = await storage.updateTemplate(parseInt(id), req.body);
      res.json(template);
    } catch (error) {
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete template (admin)
  app.delete("/api/admin/templates/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Alleen admins kunnen templates verwijderen" });
      }

      const { id } = req.params;
      await storage.deleteTemplate(parseInt(id));
      res.json({ message: "Template verwijderd" });
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Favicon upload endpoint - specific for .ico files
  app.post('/api/upload/favicon', requireAuth, faviconUpload.single('favicon'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No favicon file uploaded' });
    }
    
    const faviconPath = `/${req.file.filename}`;
    res.json({ faviconPath });
  });

  // Get available favicon files
  app.get('/api/favicons', (req, res) => {
    try {
      const publicDir = path.join(process.cwd(), 'client', 'public');
      const files = fs.readdirSync(publicDir);
      const faviconFiles = files
        .filter(file => file.toLowerCase().endsWith('.ico'))
        .map(file => ({
          name: file,
          path: `/${file}`,
          size: fs.statSync(path.join(publicDir, file)).size,
          lastModified: fs.statSync(path.join(publicDir, file)).mtime
        }));
      
      res.json(faviconFiles);
    } catch (error) {
      console.error('Error reading favicon files:', error);
      res.status(500).json({ message: 'Error reading favicon files' });
    }
  });

  // Delete favicon file
  app.delete('/api/favicons/:filename', requireAuth, (req, res) => {
    try {
      const filename = req.params.filename;
      
      // Security check - only allow .ico files and prevent path traversal
      if (!filename.toLowerCase().endsWith('.ico') || filename.includes('/') || filename.includes('..')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }

      const filePath = path.join(process.cwd(), 'client', 'public', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'Favicon deleted successfully' });
      } else {
        res.status(404).json({ message: 'Favicon file not found' });
      }
    } catch (error) {
      console.error('Error deleting favicon:', error);
      res.status(500).json({ message: 'Error deleting favicon file' });
    }
  });

  // Site Images API routes
  // Get site images by type (background, logo, social)
  app.get('/api/site-images/:imageType', (req, res) => {
    try {
      const imageType = req.params.imageType;
      
      // Validate image type
      if (!['background', 'logo', 'social'].includes(imageType)) {
        return res.status(400).json({ message: 'Invalid image type' });
      }

      // Map imageType to actual folder names (handle plural forms)
      const folderMap = {
        background: 'backgrounds',
        logo: 'logo', 
        social: 'social'
      };
      const actualFolder = folderMap[imageType as keyof typeof folderMap];
      const imagesDir = path.join(process.cwd(), 'client', 'public', 'images', actualFolder);
      
      console.log(`Looking for ${imageType} images in: ${imagesDir}`);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
        return res.json([]);
      }

      const files = fs.readdirSync(imagesDir);
      const imageFiles = files
        .filter(file => {
          const ext = file.toLowerCase();
          return ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png') || 
                 ext.endsWith('.gif') || ext.endsWith('.webp') || ext.endsWith('.svg');
        })
        .map(file => {
          const filePath = path.join(imagesDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            path: `/images/${actualFolder}/${file}`,
            size: stats.size,
            lastModified: stats.mtime
          };
        });
      
      res.json(imageFiles);
    } catch (error) {
      console.error('Error reading site image files:', error);
      res.status(500).json({ message: 'Error reading site image files' });
    }
  });

  // Delete site image file
  app.delete('/api/site-images/:imageType/:filename', requireAuth, (req, res) => {
    try {
      const { imageType, filename } = req.params;
      
      // Validate image type
      if (!['background', 'logo', 'social'].includes(imageType)) {
        return res.status(400).json({ message: 'Invalid image type' });
      }

      // Security check - prevent path traversal
      if (filename.includes('/') || filename.includes('..')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }

      // Validate file extension
      const ext = filename.toLowerCase();
      const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
      if (!validExtensions.some(validExt => ext.endsWith(validExt))) {
        return res.status(400).json({ message: 'Invalid file type' });
      }

      // Map imageType to actual folder names (handle plural forms)
      const folderMap = {
        background: 'backgrounds',
        logo: 'logo', 
        social: 'social'
      };
      const actualFolder = folderMap[imageType as keyof typeof folderMap];
      const filePath = path.join(process.cwd(), 'client', 'public', 'images', actualFolder, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'Image deleted successfully' });
      } else {
        res.status(404).json({ message: 'Image file not found' });
      }
    } catch (error) {
      console.error('Error deleting site image:', error);
      res.status(500).json({ message: 'Error deleting image file' });
    }
  });

  // Dynamic favicon route - only serve if favicon is enabled
  app.get('/favicon.ico', async (req, res) => {
    try {
      const siteSettings = await storage.getSiteSettings();
      
      if (siteSettings?.faviconEnabled && siteSettings.favicon) {
        const faviconPath = path.join(process.cwd(), 'client/public', siteSettings.favicon);
        
        // Check if favicon file exists
        try {
          await fs.promises.access(faviconPath);
          res.setHeader('Content-Type', 'image/x-icon');
          res.setHeader('Cache-Control', 'no-cache');
          return res.sendFile(faviconPath);
        } catch (fileError) {
          // File doesn't exist, return 404
          return res.status(404).send('Favicon file not found');
        }
      } else {
        // Favicon disabled or not set, return 404
        return res.status(404).send('Favicon disabled');
      }
    } catch (error) {
      console.error('Error serving favicon:', error);
      res.status(404).send('Favicon error');
    }
  });

  // Highlights API routes
  
  // Get all highlights
  app.get("/api/highlights", async (req, res) => {
    try {
      const highlights = await storage.getHomepageHighlights();
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get highlights by category
  app.get("/api/highlights/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const highlights = await storage.getHighlightsByCategory(category);
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights by category:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin routes for highlights
  app.get("/api/admin/highlights", requireAuth, async (req, res) => {
    try {
      const highlights = await storage.getAllHighlights();
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching all highlights:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create highlight
  app.post("/api/admin/highlights", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om content te maken" });
      }

      const validation = z.object({
        name: z.string().min(1),
        iconPath: z.string().min(1),
        category: z.string().optional(),
        ranking: z.number().optional(),
        active: z.boolean().optional(),
        showOnHomepage: z.boolean().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const { name, iconPath, category = "general", ranking = 0, active = true, showOnHomepage = true } = validation.data;
      
      const highlight = await storage.createHighlight({
        name,
        iconPath,
        category,
        ranking,
        active,
        showOnHomepage,
        createdBy: user.id,
      });

      res.json(highlight);
    } catch (error) {
      console.error("Error creating highlight:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update highlight
  app.put("/api/admin/highlights/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bewerken" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid highlight ID" });
      }

      const validation = z.object({
        name: z.string().min(1).optional(),
        iconPath: z.string().min(1).optional(),
        category: z.string().optional(),
        ranking: z.number().optional(),
        active: z.boolean().optional(),
      }).safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
      }

      const highlight = await storage.updateHighlight(id, validation.data);
      res.json(highlight);
    } catch (error) {
      console.error("Error updating highlight:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Delete highlight
  app.delete("/api/admin/highlights/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om content te verwijderen" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid highlight ID" });
      }

      await storage.deleteHighlight(id);
      res.json({ message: "Highlight verwijderd" });
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update highlight ranking
  app.put("/api/admin/highlights/:id/ranking", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bewerken" });
      }

      const id = parseInt(req.params.id);
      const { ranking } = req.body;

      if (isNaN(id) || typeof ranking !== 'number') {
        return res.status(400).json({ message: "Invalid input" });
      }

      await storage.updateHighlightRanking(id, ranking);
      res.json({ message: "Ranking bijgewerkt" });
    } catch (error) {
      console.error("Error updating highlight ranking:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Toggle homepage visibility for highlight
  app.patch("/api/admin/highlights/:id/homepage", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bewerken" });
      }

      const id = parseInt(req.params.id);
      const { showOnHomepage } = req.body;

      if (isNaN(id) || typeof showOnHomepage !== 'boolean') {
        return res.status(400).json({ message: "Invalid input" });
      }

      await storage.updateHighlight(id, { showOnHomepage });
      res.json({ message: showOnHomepage ? "Highlight toegevoegd aan homepage" : "Highlight verwijderd van homepage" });
    } catch (error) {
      console.error("Error toggling highlight homepage visibility:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Clean up orphaned images
  app.post("/api/admin/cleanup-images", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Alleen admins kunnen image cleanup uitvoeren" });
      }

      const results = { deletedGuides: 0, deletedDestinations: 0, errors: [] as string[] };

      // Get all image references from database
      const guidesResult = await db.execute(sql`SELECT image FROM guides WHERE image IS NOT NULL AND image != ''`);
      const destinationsResult = await db.execute(sql`SELECT image FROM destinations WHERE image IS NOT NULL AND image != ''`);
      
      const referencedImages = new Set<string>();
      guidesResult.rows.forEach((row: any) => {
        if (row.image) referencedImages.add(path.basename(row.image));
      });
      destinationsResult.rows.forEach((row: any) => {
        if (row.image) referencedImages.add(path.basename(row.image));
      });

      // Check guides directory
      const guidesDir = path.join(process.cwd(), 'client', 'public', 'images', 'guides');
      if (fs.existsSync(guidesDir)) {
        const guideFiles = fs.readdirSync(guidesDir).filter(file => 
          file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
        );
        
        for (const file of guideFiles) {
          if (!referencedImages.has(file)) {
            try {
              const filePath = path.join(guidesDir, file);
              fs.unlinkSync(filePath);
              results.deletedGuides++;
              console.log(`Cleanup: Deleted orphaned guide image: ${file}`);
            } catch (error: any) {
              results.errors.push(`Error deleting guide ${file}: ${error.message}`);
            }
          }
        }
      }

      // Check destinations directory
      const destinationsDir = path.join(process.cwd(), 'client', 'public', 'images', 'destinations');
      if (fs.existsSync(destinationsDir)) {
        const destFiles = fs.readdirSync(destinationsDir).filter(file => 
          file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png')
        );
        
        for (const file of destFiles) {
          if (!referencedImages.has(file)) {
            try {
              const filePath = path.join(destinationsDir, file);
              fs.unlinkSync(filePath);
              results.deletedDestinations++;
              console.log(`Cleanup: Deleted orphaned destination image: ${file}`);
            } catch (error: any) {
              results.errors.push(`Error deleting destination ${file}: ${error.message}`);
            }
          }
        }
      }

      res.json({
        message: `Cleanup voltooid: ${results.deletedGuides + results.deletedDestinations} bestanden verwijderd`,
        deletedGuides: results.deletedGuides,
        deletedDestinations: results.deletedDestinations,
        errors: results.errors
      });
    } catch (error) {
      console.error("Image cleanup error:", error);
      res.status(500).json({ message: "Fout bij opruimen afbeeldingen" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getPublishedActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/activities/homepage", async (req, res) => {
    try {
      const activities = await storage.getHomepageActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching homepage activities:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Activities by location API
  app.get("/api/activities/location/:location", async (req, res) => {
    try {
      const { location } = req.params;
      const activities = await storage.getActivitiesByLocation(location);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities by location:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/activities", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || (!user.canCreateContent && !user.canEditContent)) {
        return res.status(403).json({ message: "Geen toestemming om activiteiten te bekijken" });
      }

      const activities = await storage.getAllActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching admin activities:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/activities", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om activiteiten aan te maken" });
      }

      const activity = await storage.createActivity(req.body);
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Fout bij aanmaken activiteit" });
    }
  });

  app.put("/api/admin/activities/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om activiteiten te bewerken" });
      }

      const { id } = req.params;
      const activity = await storage.updateActivity(parseInt(id), req.body);
      res.json(activity);
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/activities/:id/homepage", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om activiteiten te bewerken" });
      }

      const { id } = req.params;
      const { showOnHomepage } = req.body;
      
      if (typeof showOnHomepage !== 'boolean') {
        return res.status(400).json({ message: "showOnHomepage waarde moet boolean zijn" });
      }

      const activity = await storage.updateActivity(parseInt(id), { showOnHomepage });
      res.json(activity);
    } catch (error) {
      console.error("Error toggling activity homepage:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/activities/:id/soft-delete", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om activiteiten te verwijderen" });
      }

      const { id } = req.params;
      await storage.softDeleteActivity(parseInt(id));
      res.json({ message: "Activiteit naar prullenbak verplaatst" });
    } catch (error) {
      console.error("Error soft deleting activity:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/activities/:id/restore", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om activiteiten te herstellen" });
      }

      const { id } = req.params;
      const activity = await storage.restoreActivity(parseInt(id));
      res.json(activity);
    } catch (error) {
      console.error("Error restoring activity:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/activities/deleted", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om content te bekijken" });
      }

      const activities = await storage.getDeletedActivities();
      res.json(activities);
    } catch (error) {
      console.error("Get deleted activities error:", error);
      res.status(500).json({ message: "Fout bij ophalen verwijderde activiteiten" });
    }
  });

  // Search configuration routes
  app.get("/api/admin/search-configs", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om zoek configuraties te bekijken" });
      }

      const configs = await storage.getAllSearchConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching search configs:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/admin/search-configs", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canCreateContent) {
        return res.status(403).json({ message: "Geen toestemming om zoek configuraties aan te maken" });
      }

      const config = await storage.createSearchConfig({ ...req.body, createdBy: user.id });
      res.json(config);
    } catch (error) {
      console.error("Error creating search config:", error);
      res.status(500).json({ message: "Fout bij aanmaken zoek configuratie" });
    }
  });

  app.put("/api/admin/search-configs/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canEditContent) {
        return res.status(403).json({ message: "Geen toestemming om zoek configuraties te bewerken" });
      }

      const { id } = req.params;
      const config = await storage.updateSearchConfig(parseInt(id), req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating search config:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/search-configs/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.canDeleteContent) {
        return res.status(403).json({ message: "Geen toestemming om zoek configuraties te verwijderen" });
      }

      const { id } = req.params;
      await storage.deleteSearchConfig(parseInt(id));
      res.json({ message: "Zoek configuratie verwijderd" });
    } catch (error) {
      console.error("Error deleting search config:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/search-config/:context", async (req, res) => {
    try {
      const { context } = req.params;
      const config = await storage.getSearchConfigByContext(context);
      if (!config) {
        return res.status(404).json({ message: "Zoek configuratie niet gevonden" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error fetching search config by context:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Search API routes
  app.get("/api/search", async (req, res) => {
    try {
      const { q: query, scope, location, category } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Zoekterm is verplicht" });
      }

      let results: any[] = [];

      switch (scope) {
        case 'destinations':
          results = (await storage.searchDestinations(query, location as string)).map(d => ({ ...d, type: 'destination' }));
          break;
        case 'activities':
          results = (await storage.searchActivities(query, location as string, category as string)).map(a => ({ ...a, type: 'activity' }));
          break;
        case 'highlights':
          results = (await storage.searchHighlights(query)).map(h => ({ ...h, type: 'highlight' }));
          break;
        case 'guides':
          results = (await storage.searchGuides(query)).map(g => ({ ...g, type: 'guide' }));
          break;
        case 'pages':
          results = (await storage.searchPages(query)).map(p => ({ ...p, type: 'page' }));
          break;
        case 'templates':
          results = (await storage.searchTemplates(query)).map(t => ({ ...t, type: 'template' }));
          break;
        case 'content':
          // Search all Website Onderdelen (destinations, activities, highlights, guides)
          const [destinations, activities, highlights, guides] = await Promise.all([
            storage.searchDestinations(query, location as string),
            storage.searchActivities(query, location as string, category as string),
            storage.searchHighlights(query),
            storage.searchGuides(query)
          ]);
          results = [
            ...destinations.map(d => ({ ...d, type: 'destination' })),
            ...activities.map(a => ({ ...a, type: 'activity' })),
            ...highlights.map(h => ({ ...h, type: 'highlight' })),
            ...guides.map(g => ({ ...g, type: 'guide' }))
          ];
          break;
        default:
          // Search all (including pages and templates)
          const [allDestinations, allActivities, allHighlights, allGuides, allPages, allTemplates] = await Promise.all([
            storage.searchDestinations(query, location as string),
            storage.searchActivities(query, location as string, category as string),
            storage.searchHighlights(query),
            storage.searchGuides(query),
            storage.searchPages(query),
            storage.searchTemplates(query)
          ]);
          results = [
            ...allDestinations.map(d => ({ ...d, type: 'destination' })),
            ...allActivities.map(a => ({ ...a, type: 'activity' })),
            ...allHighlights.map(h => ({ ...h, type: 'highlight' })),
            ...allGuides.map(g => ({ ...g, type: 'guide' })),
            ...allPages.map(p => ({ ...p, type: 'page' })),
            ...allTemplates.map(t => ({ ...t, type: 'template' }))
          ];
      }

      res.json({ results, query, scope: scope || 'all' });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Zoekfout" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
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
const uploadsDir = path.join(process.cwd(), 'client/public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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
    
    upload.single('image')(req, res, (err) => {
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
      
      // Return the path that can be used in the frontend
      const imagePath = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        message: "Afbeelding succesvol geüpload",
        imagePath: imagePath
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

  const httpServer = createServer(app);
  return httpServer;
}

// Vercel serverless function handler
import express from 'express';
import { registerRoutes } from '../dist/routes.js';

// Create Express app for serverless (initialize once)
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes (this happens at module load time)
const initializeRoutes = async () => {
  try {
    await registerRoutes(app);
    console.log('Routes initialized successfully');
  } catch (error) {
    console.error('Failed to initialize routes:', error);
    throw error;
  }
};

// Initialize when first request comes in
let isInitialized = false;

// Export the serverless handler
export default async function handler(req, res) {
  try {
    // Initialize routes on first request
    if (!isInitialized) {
      await initializeRoutes();
      isInitialized = true;
    }
    
    // Handle the request
    app(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
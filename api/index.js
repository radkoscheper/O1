// Vercel serverless function for Express app
import express from 'express';
import { registerRoutes } from '../dist/routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize app for serverless
let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await registerRoutes(app);
    initialized = true;
  }
  
  return app(req, res);
}
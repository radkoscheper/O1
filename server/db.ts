import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Platform detection and optimization
const isPlatform = {
  vercel: process.env.VERCEL === '1',
  railway: process.env.RAILWAY_ENVIRONMENT_NAME !== undefined,
  render: process.env.RENDER === 'true',
  netlify: process.env.NETLIFY === 'true',
  replit: process.env.REPLIT_DB_URL !== undefined
};

// Serverless-optimized connection configuration
const getPoolConfig = () => {
  const baseConfig = {
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  };

  if (isPlatform.vercel) {
    return {
      ...baseConfig,
      max: 1, // Serverless functions work better with single connections
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 5000,
      allowExitOnIdle: true
    };
  }

  if (isPlatform.railway || isPlatform.render) {
    return {
      ...baseConfig,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    };
  }

  // Default configuration for Replit and others
  return {
    ...baseConfig,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  };
};

export const pool = new Pool(getPoolConfig());

// Enhanced error handling and connection monitoring
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', () => {
  console.log('Database connection established');
});

export const db = drizzle(pool, { schema });

// Platform information provider for admin panel
export const getPlatformInfo = () => {
  let detectedPlatform = 'development';
  
  if (isPlatform.vercel) detectedPlatform = 'vercel';
  else if (isPlatform.railway) detectedPlatform = 'railway';
  else if (isPlatform.render) detectedPlatform = 'render';
  else if (isPlatform.netlify) detectedPlatform = 'netlify';
  else if (isPlatform.replit) detectedPlatform = 'replit';

  return {
    platform: detectedPlatform,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage ? process.cpuUsage() : null,
    platformSpecific: {
      vercel: isPlatform.vercel,
      railway: isPlatform.railway,
      render: isPlatform.render,
      netlify: isPlatform.netlify,
      replit: isPlatform.replit
    }
  };
};

// Database connection tester for admin panel
export const testDatabaseConnection = async () => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT NOW() as current_time, version() as db_version');
    const duration = Date.now() - start;
    
    return {
      status: 'connected',
      responseTime: duration,
      serverTime: result.rows[0]?.current_time,
      version: result.rows[0]?.db_version?.split(' ')[0] || 'Unknown',
      platform: Object.keys(isPlatform).find(key => isPlatform[key as keyof typeof isPlatform]) || 'unknown',
      poolInfo: {
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingClients: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      platform: Object.keys(isPlatform).find(key => isPlatform[key as keyof typeof isPlatform]) || 'unknown'
    };
  }
};



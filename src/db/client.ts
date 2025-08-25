import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL env var not set');
  }
  
  // Optimize connection pool settings to reduce compute usage
  const pool = new Pool({ 
    connectionString: url,
    // Limit maximum connections to prevent overwhelming the database
    max: 5, // Reduced from 10 to be more conservative
    // Close idle connections after 30 seconds to save resources
    idleTimeoutMillis: 30000,
    // Close connections after 60 seconds of inactivity
    connectionTimeoutMillis: 60000,
    // Enable keep-alive to maintain connections efficiently
    keepAlive: true,
    // Allow the pool to handle connection errors gracefully
    allowExitOnIdle: true
  });

  // Monitor pool events to detect connection issues
  pool.on('connect', () => {
    console.log('🟢 New database connection established');
  });

  pool.on('error', (err) => {
    console.error('🔴 Database pool error:', err);
  });

  pool.on('remove', () => {
    console.log('🟡 Database connection removed from pool');
  });
  
  _db = drizzle(pool, { schema });
  return _db;
}

export const db = new Proxy({}, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  }
}) as unknown as ReturnType<typeof drizzle>;

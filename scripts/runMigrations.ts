import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { getDb } from '@/db/client';
import { Pool } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  const pool = new Pool({ 
  connectionString: url,
  max: 2, // Minimal connections for migrations
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true
});
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query(`create table if not exists drizzle_migrations ( id serial primary key, hash text not null unique, created_at timestamptz not null default now());`);

    const appliedRes = await client.query<{ hash: string }>('select hash from drizzle_migrations');
    const applied = new Set(appliedRes.rows.map(r => r.hash));

    const migrationsDir = path.join(process.cwd(), 'drizzle');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = fs.readFileSync(full, 'utf8');
      const hash = createHash(sql);
      if (applied.has(hash)) {
        console.log('Skip', file);
        continue;
      }
      console.log('Applying', file);
      
      // Split SQL into individual statements and execute them
      const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
      
      for (const statement of statements) {
        try {
          await client.query(statement);
        } catch (error: any) {
          // If table already exists, skip it (for CREATE TABLE statements)
          if (error.code === '42P07' && statement.toLowerCase().includes('create table')) {
            console.log('  Table already exists, skipping...');
            continue;
          }
          // If index already exists, skip it
          if (error.code === '42P11' && statement.toLowerCase().includes('create index')) {
            console.log('  Index already exists, skipping...');
            continue;
          }
          // If constraint already exists, skip it
          if (error.code === '42710' && statement.toLowerCase().includes('create')) {
            console.log('  Constraint/index already exists, skipping...');
            continue;
          }
          console.error('Error executing statement:', statement);
          console.error('Error details:', error.message);
          throw error;
        }
      }
      
      await client.query('insert into drizzle_migrations (hash) values ($1)', [hash]);
    }
    await client.query('commit');
    console.log('Migrations complete');
  } catch (e) {
    try {
      await client.query('rollback');
    } catch (rollbackError) {
      console.error('Failed to rollback:', rollbackError);
    }
    console.error(e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

function createHash(input: string) {
  // very simple hash (not cryptographically strong) for tracking; replace with crypto if needed
  let h = 0, i = 0, len = input.length;
  while (i < len) h = (Math.imul(31, h) + input.charCodeAt(i++)) | 0;
  return String(h);
}

main();

import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set');
  
  const pool = new Pool({ 
  connectionString: url,
  max: 2, // Minimal connections for setup
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true
});
  const client = await pool.connect();
  
  try {
    console.log('Setting up database...');
    
    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(64) NOT NULL UNIQUE,
        stock INTEGER NOT NULL DEFAULT 0,
        threshold INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Products table created');
    
    // Create alert_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS alert_logs (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL,
        stock_before INTEGER,
        stock_after INTEGER NOT NULL,
        threshold INTEGER NOT NULL,
        channel TEXT NOT NULL,
        dedupe_key TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Alert logs table created');
    
    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS products_name_idx ON products USING btree (name);',
      'CREATE INDEX IF NOT EXISTS products_sku_idx ON products USING btree (sku);',
      'CREATE INDEX IF NOT EXISTS products_stock_idx ON products USING btree (stock);',
      'CREATE INDEX IF NOT EXISTS products_threshold_idx ON products USING btree (threshold);',
      'CREATE INDEX IF NOT EXISTS products_low_stock_idx ON products USING btree (stock, threshold);',
      'CREATE INDEX IF NOT EXISTS alert_logs_product_id_idx ON alert_logs USING btree (product_id);',
      'CREATE INDEX IF NOT EXISTS alert_logs_created_at_idx ON alert_logs USING btree (created_at);',
      'CREATE INDEX IF NOT EXISTS alert_logs_dedupe_key_idx ON alert_logs USING btree (dedupe_key);'
    ];
    
    for (const index of indexes) {
      await client.query(index);
    }
    console.log('✓ All indexes created');
    
    console.log('Database setup complete!');
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

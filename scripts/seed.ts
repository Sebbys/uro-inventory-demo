import 'dotenv/config';
import { db, getDb } from '@/db/client';
import { products } from '@/db/schema';
import { sql } from 'drizzle-orm';

async function main() {
  await getDb();
  const force = process.argv.includes('--force') || process.env.FORCE === '1';
  const existing = await db.select().from(products);
  if (existing.length > 0 && !force) {
    console.log('Products already exist, skipping seed (use --force or FORCE=1 to reseed)');
    return;
  }
  if (force) {
    console.log('Force reseed: truncating products table...');
    await db.execute(sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE`);
  }
  const base = [
    'Widget','Gadget','Module','Component','Part','Item','Accessory','Unit','Tool','Device'
  ];
  const sample: { name:string; sku:string; stock:number; threshold:number }[] = [];
  let counter = 1;
  for (const b of base) {
    for (let i=0;i<5;i++) {
      const stock = Math.floor(Math.random()*50);
      const threshold = Math.floor(Math.random()*15)+2;
      const name = `${b} ${String.fromCharCode(65+i)}`;
      const sku = `${b.substring(0,3).toUpperCase()}-${counter.toString().padStart(4,'0')}`;
      sample.push({ name, sku, stock, threshold });
      counter++;
    }
  }
  // Ensure at least a few low stock examples
  sample.push({ name: 'Critical Bolt', sku: 'CRB-LOW1', stock: 1, threshold: 10 });
  sample.push({ name: 'Emergency Fuse', sku: 'EMF-LOW2', stock: 0, threshold: 5 });
  await db.insert(products).values(sample);
  console.log(`Seed complete: inserted ${sample.length} products${force ? ' (forced)' : ''}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

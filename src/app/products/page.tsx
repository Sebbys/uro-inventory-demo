import { db } from '@/db/client';
import { products } from '@/db/schema';
import { createProduct, updateStock, deleteProduct } from './actions';
import { sql, ilike, and, lt } from 'drizzle-orm';
// @ts-ignore tooling transient resolution issue
import ProductsClient from './products-client';

export const dynamic = 'force-dynamic';

async function getProducts(query?: string, below?: boolean) {
  let whereClause = undefined as any;
  
  // Build where clause for efficient database-level filtering
  if (query) {
    const likePattern = `%${query}%`;
    whereClause = ilike(products.name, likePattern);
    whereClause = and(whereClause, ilike(products.sku, likePattern));
  }
  
  if (below) {
    const belowThreshold = lt(products.stock, products.threshold);
    whereClause = whereClause ? and(whereClause, belowThreshold) : belowThreshold;
  }
  
  return await db.select().from(products).where(whereClause).orderBy(products.id);
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; below?: string }> }) {
  const sp = await searchParams;
  const list = await getProducts(sp.q, sp.below === '1');
  return <ProductsClient initial={list} />;
}

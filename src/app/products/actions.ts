'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { emitStockUpdate } from '@/lib/events';

export async function createProduct(formData: FormData): Promise<void> {
  const name = String(formData.get('name') || '').trim();
  const sku = String(formData.get('sku') || '').trim();
  const stock = Number(formData.get('stock') || 0);
  const threshold = Number(formData.get('threshold') || 0);
  if (!name || !sku) return;
  const [created] = await db.insert(products).values({ name, sku, stock, threshold }).returning();
  emitStockUpdate({
    type: 'stock.updated',
    productId: created.id,
    sku: created.sku,
    name: created.name,
    stock: created.stock,
    threshold: created.threshold,
    belowThreshold: created.stock < created.threshold,
  });
  revalidatePath('/products');
}

export async function updateStock(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  const newStock = Number(formData.get('stock'));
  if (!id || Number.isNaN(newStock)) return;
  
  // Use a single query with RETURNING to get both old and new values
  const [updated] = await db
    .update(products)
    .set({ stock: newStock, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
    
  if (updated) {
    // Only emit event if stock actually changed (you might want to track this in a separate field)
    emitStockUpdate({
      type: 'stock.updated',
      productId: updated.id,
      sku: updated.sku,
      name: updated.name,
      stock: updated.stock,
      threshold: updated.threshold,
      belowThreshold: updated.stock < updated.threshold,
    });
  }
  revalidatePath('/products');
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const id = Number(formData.get('id'));
  if (!id) return;
  await db.delete(products).where(eq(products.id, id));
  revalidatePath('/products');
}

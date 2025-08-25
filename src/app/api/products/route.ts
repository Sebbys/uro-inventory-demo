import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { products } from '@/db/schema';
import { eq, and, lt, sql } from 'drizzle-orm';
import { emitStockUpdate } from '@/lib/events';

// Simple shared token auth (optional for MVP)
function assertAuth(req: NextRequest) {
  const token = req.headers.get('x-admin-token');
  const expected = process.env.ADMIN_TOKEN;
  if (expected && token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const unauthorized = assertAuth(req);
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const below = searchParams.get('below');

  let where = undefined as any;
  if (q) {
    const like = `%${q}%`;
    where = and(where, sql`${products.name} ILIKE ${like} OR ${products.sku} ILIKE ${like}`);
  }
  if (below === 'threshold') {
    where = and(where, lt(products.stock, products.threshold));
  }
  const rows = await db.select().from(products).where(where).orderBy(products.id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const unauthorized = assertAuth(req);
  if (unauthorized) return unauthorized;
  const body = await req.json();
  const { name, sku, stock = 0, threshold = 0 } = body;
  if (!name || !sku) {
    return NextResponse.json({ error: 'name and sku required' }, { status: 400 });
  }
  const [created] = await db.insert(products).values({ name, sku, stock, threshold }).returning();
  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const unauthorized = assertAuth(req);
  if (unauthorized) return unauthorized;
  const body = await req.json();
  const { id, name, sku, stock, threshold } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const values: any = { updatedAt: new Date() };
  if (name !== undefined) values.name = name;
  if (sku !== undefined) values.sku = sku;
  if (stock !== undefined) values.stock = stock;
  if (threshold !== undefined) values.threshold = threshold;
  const old = await db.select().from(products).where(eq(products.id, id));
  const prev = old[0];
  const [updated] = await db.update(products).set(values).where(eq(products.id, id)).returning();
  if (updated && prev && stock !== undefined && stock !== prev.stock) {
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
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const unauthorized = assertAuth(req);
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning();
  return NextResponse.json(deleted);
}

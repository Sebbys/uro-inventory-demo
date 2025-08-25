import { NextRequest, NextResponse } from 'next/server';
import { sendGlobalLowStockReport } from '@/lib/discord';
import { db } from '@/db/client';
import { alertLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, channel, dedupeKey } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items provided for global report' },
        { status: 400 }
      );
    }

    // Check if we've already sent a global report recently (deduplication)
    const recentReport = await db
      .select()
      .from(alertLogs)
      .where(
        and(
          eq(alertLogs.channel, channel),
          eq(alertLogs.dedupeKey, dedupeKey)
        )
      )
      .limit(1);

    if (recentReport.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Global report already sent recently' },
        { status: 409 }
      );
    }

    // Send global Discord report
    const reportSent = await sendGlobalLowStockReport(items);

    if (!reportSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send global report' },
        { status: 500 }
      );
    }

    // Log the global report in the database
    await db.insert(alertLogs).values({
      productId: 0, // 0 indicates a global report
      stockBefore: items.length,
      stockAfter: items.length,
      threshold: items.length,
      channel,
      dedupeKey,
      createdAt: new Date()
    });

    return NextResponse.json({ 
      success: true, 
      itemsReported: items.length,
      criticalItems: items.filter(item => item.stock === 0).length,
      lowStockItems: items.filter(item => item.stock > 0 && item.stock < item.threshold).length
    });
  } catch (error) {
    console.error('Global report API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Get current low stock items for preview
  try {
    const lowStockItems = await db
      .select({
        id: db.products.id,
        name: db.products.name,
        sku: db.products.sku,
        stock: db.products.stock,
        threshold: db.products.threshold
      })
      .from(db.products)
      .where(db.products.stock < db.products.threshold)
      .orderBy(db.products.stock);

    return NextResponse.json({
      success: true,
      lowStockItems,
      totalItems: lowStockItems.length,
      criticalItems: lowStockItems.filter(item => item.stock === 0).length,
      lowStockOnly: lowStockItems.filter(item => item.stock > 0).length
    });
  } catch (error) {
    console.error('Failed to get low stock items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get low stock items' },
      { status: 500 }
    );
  }
}

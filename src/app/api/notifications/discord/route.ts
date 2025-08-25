import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordNotification } from '@/lib/discord';
import { db } from '@/db/client';
import { alertLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, productName, sku, currentStock, threshold, channel, dedupeKey } = body;

    // Validate required fields
    if (!productId || !productName || !sku || currentStock === undefined || !threshold) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if we've already sent a notification for this product recently (deduplication)
    const recentNotification = await db
      .select()
      .from(alertLogs)
      .where(
        and(
          eq(alertLogs.productId, productId),
          eq(alertLogs.channel, channel),
          eq(alertLogs.dedupeKey, dedupeKey)
        )
      )
      .limit(1);

    if (recentNotification.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Notification already sent recently' },
        { status: 409 }
      );
    }

    // Send Discord notification
    const notificationSent = await sendDiscordNotification({
      productId,
      productName,
      sku,
      currentStock,
      threshold,
      channel: 'discord',
      dedupeKey
    });

    if (!notificationSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send Discord notification' },
        { status: 500 }
      );
    }

    // Log the notification in the database
    await db.insert(alertLogs).values({
      productId,
      stockBefore: currentStock,
      stockAfter: currentStock,
      threshold,
      channel,
      dedupeKey,
      createdAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Discord notification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Test endpoint to verify webhook configuration
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { success: false, error: 'Discord webhook URL not configured' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      configured: true,
      webhookUrl: webhookUrl.substring(0, 20) + '...' // Only show first 20 chars for security
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check configuration' },
      { status: 500 }
    );
  }
}

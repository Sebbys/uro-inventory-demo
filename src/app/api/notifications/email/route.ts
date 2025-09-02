import { NextRequest, NextResponse } from 'next/server';
import { sendEmailReport } from '@/lib/email';
import { EmailReportData } from '@/lib/email-template';
import { db } from '@/db/client';
import { alertLogs, products } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, subject, items, dedupeKey } = body as {
      email: string | string[];
      subject: string;
      items?: Array<{ id: number; name: string; sku: string; stock: number; threshold: number }>;
      dedupeKey?: string;
    };

    // Validate required fields
    if (!email || !subject) {
      return NextResponse.json(
        { success: false, error: 'Email and subject are required' },
        { status: 400 }
      );
    }

    // Normalize recipients: support comma/semicolon separated string or array
    const recipients: string[] = Array.isArray(email)
      ? email
      : String(email)
          .split(/[;,]/)
          .map((e) => e.trim())
          .filter(Boolean);

    // Basic email validation
    const emailRegex = /.+@.+\..+/;
    const invalid = recipients.filter((e) => !emailRegex.test(e));
    if (recipients.length === 0 || invalid.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid recipient email(s): ${invalid.join(', ')}` },
        { status: 400 }
      );
    }

    // If items not provided, get current low stock items
    let reportItems: { id: number; name: string; sku: string; stock: number; threshold: number; }[] = Array.isArray(items) ? items : [];
    if (reportItems.length === 0) {
      const lowStockItems = await db
        .select({
          id: products.id,
          name: products.name,
          sku: products.sku,
          stock: products.stock,
          threshold: products.threshold
        })
        .from(products)
        .where(lt(products.stock, products.threshold))
        .orderBy(products.stock);

      reportItems = lowStockItems;
    }

    if (reportItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No low stock items to report' },
        { status: 400 }
      );
    }

    // Check if we've already sent an email report recently (deduplication)
    const recentReport = await db
      .select()
      .from(alertLogs)
      .where(
        and(
          eq(alertLogs.channel, 'email'),
          eq(alertLogs.dedupeKey, dedupeKey || `email-${Date.now()}`)
        )
      )
      .limit(1);

    if (recentReport.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email report already sent recently' },
        { status: 409 }
      );
    }

    // Prepare email data
    const criticalItems = reportItems.filter((item: any) => item.stock === 0);
    const lowStockItems = reportItems.filter((item: any) => item.stock > 0 && item.stock < item.threshold);

  const emailData: EmailReportData = {
      items: reportItems,
      totalItems: reportItems.length,
      criticalItems: criticalItems.length,
      lowStockItems: lowStockItems.length,
      reportDate: new Date().toLocaleDateString()
    };

    // Send email report
    const reportSent = await sendEmailReport({
      to: recipients,
      subject,
      data: emailData,
    });

    if (!reportSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send email report' },
        { status: 500 }
      );
    }

    // Log the email report in the database
    await db.insert(alertLogs).values({
      productId: 0, // 0 indicates a global report
      stockBefore: reportItems.length,
      stockAfter: reportItems.length,
      threshold: reportItems.length,
      channel: 'email',
      dedupeKey: dedupeKey || `email-${Date.now()}`,
      createdAt: new Date()
    });

    return NextResponse.json({
      success: true,
      itemsReported: reportItems.length,
      criticalItems: criticalItems.length,
      lowStockItems: lowStockItems.length,
      recipients,
    });
  } catch (error) {
    console.error('Email report API error:', error);
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
        id: products.id,
        name: products.name,
        sku: products.sku,
        stock: products.stock,
        threshold: products.threshold
      })
      .from(products)
      .where(lt(products.stock, products.threshold))
      .orderBy(products.stock);

    const criticalItems = lowStockItems.filter(item => item.stock === 0);
    const lowStockOnly = lowStockItems.filter(item => item.stock > 0);

    return NextResponse.json({
      success: true,
      lowStockItems,
      totalItems: lowStockItems.length,
      criticalItems: criticalItems.length,
      lowStockOnly: lowStockOnly.length
    });
  } catch (error) {
    console.error('Failed to get low stock items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get low stock items' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sendEmailReport } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Testing email sending to:', email);

    const testData = {
      items: [
        {
          id: 1,
          name: 'Test Product',
          sku: 'TEST-001',
          stock: 0,
          threshold: 10
        }
      ],
      totalItems: 1,
      criticalItems: 1,
      lowStockItems: 0,
      reportDate: new Date().toLocaleDateString()
    };

    const result = await sendEmailReport({
      to: email,
      subject: 'Test Email - Inventory System',
      data: testData
    });

    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully',
        email: email
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send test email' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

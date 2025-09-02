import { Resend } from 'resend';
import { EmailTemplate, EmailReportData } from './email-template';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailNotification {
  to: string | string[];
  subject: string;
  data: EmailReportData;
}

export async function sendEmailReport(notification: EmailNotification): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend API key not configured');
    return false;
  }

  try {
    console.log('Attempting to send email to:', notification.to);
    console.log('Using API key:', process.env.RESEND_API_KEY.substring(0, 10) + '...');
    
    const { data, error } = await resend.emails.send({
      from: 'inventory@nightfall.run', // Use Resend's default sender for testing
      to: Array.isArray(notification.to) ? notification.to : [notification.to],
      subject: notification.subject,
      react: EmailTemplate({ data: notification.data }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return false;
    }

    console.log('Email report sent successfully:', data);
    console.log('Email ID:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send email report:', error);
    return false;
  }
}

export async function sendEmailTestNotification(): Promise<boolean> {
  const testData: EmailReportData = {
    items: [
      {
        id: 1,
        name: 'Sample Product 1',
        sku: 'SAMPLE-001',
        stock: 0,
        threshold: 10
      },
      {
        id: 2,
        name: 'Sample Product 2',
        sku: 'SAMPLE-002',
        stock: 5,
        threshold: 15
      }
    ],
    totalItems: 2,
    criticalItems: 1,
    lowStockItems: 1,
    reportDate: new Date().toLocaleDateString()
  };

  return sendEmailReport({
    to: 'test@example.com',
    subject: 'Test Inventory Report',
    data: testData
  });
}

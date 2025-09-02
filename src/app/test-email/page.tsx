'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleTestEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Test email sent to ${email}! Check your inbox and spam folder.`);
      } else {
        toast.error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error('Failed to send test email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Test Email Sending</CardTitle>
            <CardDescription>
              Test your Resend email configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={handleTestEmail}
              disabled={isSending || !email}
              className="w-full"
            >
              {isSending ? 'Sending...' : 'Send Test Email'}
            </Button>

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Debugging Steps:</strong></p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your spam/junk folder</li>
                <li>Verify your Resend API key is correct</li>
                <li>Check the browser console for errors</li>
                <li>Check your Resend dashboard for delivery status</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

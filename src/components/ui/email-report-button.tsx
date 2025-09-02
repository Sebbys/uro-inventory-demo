'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  Clock,
} from 'lucide-react';

interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
}

interface EmailReportButtonProps {
  lowStockItems: Array<LowStockItem>;
  className?: string;
}

export function EmailReportButton({ lowStockItems, className }: EmailReportButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSendEmailReport = async () => {
    if (lowStockItems.length === 0) {
      toast.error('No low stock items to report');
      return;
    }

    if (!email) {
      toast.error('Please enter at least one email address');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, // supports comma or semicolon separated list
          subject: `Inventory Report - ${lowStockItems.length} items need attention`,
          items: lowStockItems,
          dedupeKey: `email-report-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email report');
      }

      const result = await response.json();
      
      if (result.success) {
        setLastSent(new Date());
        setShowForm(false);
        toast.success(`Email report sent successfully to ${email}!`);
      } else {
        throw new Error(result.error || 'Failed to send email report');
      }
    } catch (error) {
      console.error('Email report error:', error);
      toast.error('Failed to send email report. Please check your Resend configuration.');
    } finally {
      setIsSending(false);
    }
  };

  const getButtonVariant = () => {
    if (lastSent) return 'outline';
    if (lowStockItems.length > 0) return 'default';
    return 'secondary';
  };

  const getButtonText = () => {
    if (isSending) return 'Sending Report...';
    if (lastSent) return 'Report Sent';
    if (lowStockItems.length > 0) return `Send Email Report (${lowStockItems.length} items)`;
    return 'No Low Stock Items';
  };

  const getButtonIcon = () => {
    if (isSending) return <Clock className="h-4 w-4" />;
    if (lastSent) return <CheckCircle className="h-4 w-4" />;
    return <Mail className="h-4 w-4" />;
  };

  const criticalItems = lowStockItems.filter(item => item.stock === 0);
  const lowStockOnly = lowStockItems.filter(item => item.stock > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Reports
        </CardTitle>
        <CardDescription>
          Send beautiful email reports to stakeholders about inventory status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {criticalItems.length}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400">
              Critical
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {lowStockOnly.length}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Low Stock
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {lowStockItems.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Total
            </div>
          </div>
        </div>

        {/* Email Form */}
        {showForm && (
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
            <div className="space-y-2">
              <Label htmlFor="email">Recipient Email(s)</Label>
              <Input
                id="email"
                type="email"
                placeholder="manager@company.com, team@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">Separate multiple emails with commas or semicolons.</p>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>This will send a beautiful HTML email report with:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Summary statistics</li>
                <li>Critical items (out of stock)</li>
                <li>Low stock items</li>
                <li>Direct link to dashboard</li>
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {!showForm && (
            <Button
              variant={getButtonVariant()}
              size="sm"
              onClick={() => setShowForm(true)}
              disabled={isSending || lowStockItems.length === 0}
              className="w-full"
            >
              {getButtonIcon()}
              <span className="ml-2">{getButtonText()}</span>
            </Button>
          )}

          {showForm && (
            <div className="space-y-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSendEmailReport}
                disabled={isSending || !email || lowStockItems.length === 0}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Email Report'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEmail('');
                }}
                disabled={isSending}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Status */}
        {lastSent && (
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sent {lastSent.toLocaleTimeString()}
            </Badge>
          </div>
        )}

        {/* No Items Message */}
        {lowStockItems.length === 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>All Good!</strong> No low stock items to report.
            </p>
          </div>
        )}

        {/* Setup Instructions */}
        <Separator />
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-1">Setup Required:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a></li>
            <li>Add your API key to <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">RESEND_API_KEY</code></li>
            <li>Update sender email in <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">src/lib/email.ts</code></li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Loader2, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface GlobalReportButtonProps {
  lowStockItems: Array<{
    id: number;
    name: string;
    sku: string;
    stock: number;
    threshold: number;
  }>;
  className?: string;
}

export function GlobalReportButton({ lowStockItems, className }: GlobalReportButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const handleSendGlobalReport = async () => {
    if (lowStockItems.length === 0) {
      toast.error('No low stock items to report');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch('/api/notifications/global-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: lowStockItems,
          channel: 'discord',
          dedupeKey: `global-report-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send global report');
      }

      const result = await response.json();
      
      if (result.success) {
        setLastSent(new Date());
        toast.success(`Global report sent successfully! ${lowStockItems.length} items reported.`);
      } else {
        throw new Error(result.error || 'Failed to send global report');
      }
    } catch (error) {
      console.error('Global report error:', error);
      toast.error('Failed to send global report. Please check your webhook configuration.');
    } finally {
      setIsSending(false);
    }
  };

  const getButtonVariant = () => {
    if (lastSent) return 'outline';
    if (lowStockItems.length > 0) return 'destructive';
    return 'secondary';
  };

  const getButtonText = () => {
    if (isSending) return 'Sending Report...';
    if (lastSent) return 'Report Sent';
    if (lowStockItems.length > 0) return `Send Global Report (${lowStockItems.length} items)`;
    return 'No Low Stock Items';
  };

  const getButtonIcon = () => {
    if (isSending) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (lastSent) return <CheckCircle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const criticalItems = lowStockItems.filter(item => item.stock === 0);
  const lowStockOnly = lowStockItems.filter(item => item.stock > 0);

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Global Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm font-medium">Low Stock Report</span>
          </div>
          {lowStockItems.length > 0 && (
            <div className="flex items-center gap-2">
              {criticalItems.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {criticalItems.length} Critical
                </Badge>
              )}
              {lowStockOnly.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {lowStockOnly.length} Low Stock
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Send a comprehensive report of all low stock items to Discord.
          </p>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant={getButtonVariant()}
            size="sm"
            onClick={handleSendGlobalReport}
            disabled={isSending || lowStockItems.length === 0}
            className="w-full"
          >
            {getButtonIcon()}
            <span className="ml-2">{getButtonText()}</span>
          </Button>
        </div>

        {lastSent && (
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sent {lastSent.toLocaleTimeString()}
            </Badge>
          </div>
        )}

        {lowStockItems.length === 0 && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>All Good!</strong> No low stock items to report.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

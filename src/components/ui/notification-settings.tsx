"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, CheckCircle, XCircle, Loader2, Settings, TestTube } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkConfiguration();
  }, []);

  const checkConfiguration = async () => {
    try {
      const response = await fetch('/api/notifications/discord');
      const data = await response.json();
      setIsConfigured(data.configured || false);
    } catch (error) {
      console.error('Failed to check configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/notifications/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 0,
          productName: 'Test Product',
          sku: 'TEST-001',
          currentStock: 5,
          threshold: 10,
          channel: 'discord',
          dedupeKey: `test-${Date.now()}`
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test notification sent successfully! Check your Discord channel.');
      } else {
        toast.error(result.error || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (isConfigured) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (isConfigured) return 'Configured';
    return 'Not Configured';
  };

  const getStatusVariant = () => {
    if (isLoading) return 'secondary';
    if (isConfigured) return 'default';
    return 'destructive';
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Discord Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="text-sm font-medium">Discord Webhook</span>
          </div>
          <Badge variant={getStatusVariant()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Discord webhook is configured via environment variable.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="notifications-enabled"
            checked={isConfigured}
            disabled
          />
          <Label htmlFor="notifications-enabled" className="text-sm">
            Enable Discord notifications
          </Label>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={handleTestNotification}
            disabled={!isConfigured || isTesting}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending Test...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Send Test Notification
              </>
            )}
          </Button>
        </div>

        {!isConfigured && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Setup Required:</strong> Add your Discord webhook URL to the DISCORD_WEBHOOK_URL environment variable to enable notifications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationButtonProps {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  isLowStock: boolean;
  className?: string;
}

export function NotificationButton({
  productId,
  productName,
  sku,
  currentStock,
  threshold,
  isLowStock,
  className
}: NotificationButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<Date | null>(null);

  const handleSendNotification = async () => {
    if (!isLowStock) {
      toast.error('Notifications are only available for low stock items');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await fetch('/api/notifications/discord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          productName,
          sku,
          currentStock,
          threshold,
          channel: 'discord',
          dedupeKey: `manual-${productId}-${Date.now()}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      
      if (result.success) {
        setLastSent(new Date());
        toast.success('Discord notification sent successfully!');
      } else {
        throw new Error(result.error || 'Failed to send notification');
      }
    } catch (error) {
      console.error('Notification error:', error);
      toast.error('Failed to send Discord notification. Please check your webhook configuration.');
    } finally {
      setIsSending(false);
    }
  };

  const getButtonVariant = () => {
    if (lastSent) return 'outline';
    if (isLowStock) return 'destructive';
    return 'secondary';
  };

  const getButtonText = () => {
    if (isSending) return 'Sending...';
    if (lastSent) return 'Sent';
    if (isLowStock) return 'Notify Discord';
    return 'Notify Discord';
  };

  const getButtonIcon = () => {
    if (isSending) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (lastSent) return <CheckCircle className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant={getButtonVariant()}
        size="sm"
        onClick={handleSendNotification}
        disabled={isSending || !isLowStock}
        className="h-8 px-3"
      >
        {getButtonIcon()}
        <span className="ml-2">{getButtonText()}</span>
      </Button>
      
      {lastSent && (
        <Badge variant="secondary" className="text-xs">
          Sent {lastSent.toLocaleTimeString()}
        </Badge>
      )}
      
      {!isLowStock && (
        <Badge variant="outline" className="text-xs text-muted-foreground">
          Stock OK
        </Badge>
      )}
    </div>
  );
}

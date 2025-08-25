// Emit stock update events to the Cloudflare Worker /ingest endpoint.
// Worker expects shape:
// {
//   type: "product.stock.updated",
//   occurredAt: ISO_STRING,
//   data: { productId, stock, threshold, name, sku }
// }

import { sendDiscordNotification } from './discord';

export interface StockUpdateEvent {
  type: 'stock.updated';
  productId: number;
  sku: string;
  name: string;
  stock: number;
  threshold: number;
  belowThreshold: boolean;
}

// Cache for deduplication to prevent duplicate API calls
const recentEvents = new Map<string, number>();
const DEDUPE_WINDOW = 5000; // 5 seconds

export async function emitStockUpdate(ev: StockUpdateEvent) {
  // Send Discord notification if stock is low
  if (ev.belowThreshold) {
    try {
      await sendDiscordNotification({
        productId: ev.productId,
        productName: ev.name,
        sku: ev.sku,
        currentStock: ev.stock,
        threshold: ev.threshold,
        channel: 'discord',
        dedupeKey: `auto-${ev.productId}-${Date.now()}`
      });
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }
  const url = process.env.WORKER_INGRESS_URL;
  if (!url) return; // silent no-op
  
  // Only send if below threshold to reduce unnecessary API calls
  if (!ev.belowThreshold) return;
  
  // Create dedupe key to prevent duplicate events
  const dedupeKey = `${ev.productId}-${ev.stock}-${Date.now()}`;
  const now = Date.now();
  
  // Check if we recently sent a similar event
  const recent = recentEvents.get(dedupeKey);
  if (recent && (now - recent) < DEDUPE_WINDOW) {
    return; // Skip duplicate event
  }
  
  // Update dedupe cache
  recentEvents.set(dedupeKey, now);
  
  // Clean up old entries from cache
  for (const [key, timestamp] of recentEvents.entries()) {
    if (now - timestamp > DEDUPE_WINDOW) {
      recentEvents.delete(key);
    }
  }
  
  const payload = {
    type: 'product.stock.updated',
    occurredAt: new Date().toISOString(),
    data: {
      productId: ev.productId,
      stock: ev.stock,
      threshold: ev.threshold,
      name: ev.name,
      sku: ev.sku,
    }
  };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // Worker expects x-shared-secret header
        'x-shared-secret': process.env.WORKER_SHARED_SECRET || ''
      },
      body: JSON.stringify(payload),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000)
    });
    
    if (!res.ok) {
      console.error('emitStockUpdate worker error', res.status, await safeText(res));
    }
  } catch (err) {
    // Only log errors, don't throw to prevent breaking the main flow
    if (err instanceof Error && err.name !== 'AbortError') {
      console.error('Failed to emit stock event', err);
    }
  }
}

async function safeText(res: Response) {
  try { return await res.text(); } catch { return '<no-body>'; }
}

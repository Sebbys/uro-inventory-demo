export interface DiscordNotification {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  channel: 'discord';
  dedupeKey: string;
}

export interface LowStockItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
}

export interface DiscordWebhookPayload {
  embeds: Array<{
    title: string;
    description: string;
    color: number;
    fields: Array<{
      name: string;
      value: string;
      inline: boolean;
    }>;
    timestamp: string;
    footer: {
      text: string;
    };
    thumbnail?: {
      url: string;
    };
  }>;
  username?: string;
  avatar_url?: string;
}

export async function sendDiscordNotification(notification: DiscordNotification): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return false;
  }

  const isCritical = notification.currentStock === 0;
  const isLow = notification.currentStock < notification.threshold;
  
  // Create rich embed message
  const embed: DiscordWebhookPayload['embeds'][0] = {
    title: isCritical ? '🚨 CRITICAL STOCK ALERT' : '⚠️ LOW STOCK ALERT',
    description: isCritical 
      ? `**${notification.productName}** is completely out of stock!`
      : `**${notification.productName}** is running low on stock.`,
    color: isCritical ? 0xFF0000 : 0xFFA500, // Red for critical, Orange for low
    fields: [
      {
        name: '📦 Product Details',
        value: `**Name:** ${notification.productName}\n**SKU:** \`${notification.sku}\``,
        inline: true
      },
      {
        name: '📊 Stock Status',
        value: `**Current:** ${notification.currentStock} units\n**Threshold:** ${notification.threshold} units`,
        inline: true
      },
      {
        name: '📈 Status',
        value: isCritical 
          ? '🔴 **OUT OF STOCK** - Immediate action required!'
          : `🟡 **LOW STOCK** - ${notification.threshold - notification.currentStock} units below threshold`,
        inline: false
      }
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: 'Inventory Management System'
    },
    thumbnail: {
      url: 'https://cdn.discordapp.com/emojis/📦.png'
    }
  };

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
    username: 'Inventory Bot',
    avatar_url: 'https://cdn.discordapp.com/emojis/📦.png'
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text());
      return false;
    }

    console.log('Discord notification sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
    return false;
  }
}

export async function sendGlobalLowStockReport(items: LowStockItem[]): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return false;
  }

  if (items.length === 0) {
    console.log('No low stock items to report');
    return true;
  }

  // Separate critical (out of stock) and low stock items
  const criticalItems = items.filter(item => item.stock === 0);
  const lowStockItems = items.filter(item => item.stock > 0 && item.stock < item.threshold);

  // Create comprehensive embed
  const embed: DiscordWebhookPayload['embeds'][0] = {
    title: '📊 GLOBAL INVENTORY REPORT',
    description: `**${items.length}** items require attention in your inventory.`,
    color: criticalItems.length > 0 ? 0xFF0000 : 0xFFA500, // Red if critical items exist, orange otherwise
    fields: [],
    timestamp: new Date().toISOString(),
    footer: {
      text: `Inventory Management System • Generated at ${new Date().toLocaleString()}`
    },
    thumbnail: {
      url: 'https://cdn.discordapp.com/emojis/📊.png'
    }
  };

  // Add summary field
  embed.fields.push({
    name: '📈 Summary',
    value: `**Total Items:** ${items.length}\n**Critical (Out of Stock):** ${criticalItems.length}\n**Low Stock:** ${lowStockItems.length}`,
    inline: false
  });

  // Add critical items if any
  if (criticalItems.length > 0) {
    const criticalList = criticalItems
      .slice(0, 10) // Limit to first 10 items
      .map(item => `• **${item.name}** (\`${item.sku}\`) - **0** units (threshold: ${item.threshold})`)
      .join('\n');
    
    embed.fields.push({
      name: `🚨 Critical Items (${criticalItems.length})`,
      value: criticalList + (criticalItems.length > 10 ? `\n... and ${criticalItems.length - 10} more` : ''),
      inline: false
    });
  }

  // Add low stock items if any
  if (lowStockItems.length > 0) {
    const lowStockList = lowStockItems
      .slice(0, 10) // Limit to first 10 items
      .map(item => `• **${item.name}** (\`${item.sku}\`) - **${item.stock}** units (threshold: ${item.threshold})`)
      .join('\n');
    
    embed.fields.push({
      name: `⚠️ Low Stock Items (${lowStockItems.length})`,
      value: lowStockList + (lowStockItems.length > 10 ? `\n... and ${lowStockItems.length - 10} more` : ''),
      inline: false
    });
  }

  // Add action field
  embed.fields.push({
    name: '🎯 Recommended Actions',
    value: criticalItems.length > 0 
      ? '🔴 **URGENT:** Restock critical items immediately\n🟡 **PRIORITY:** Review low stock items\n📋 **PLAN:** Update inventory management strategy'
      : '🟡 **PRIORITY:** Review low stock items\n📋 **PLAN:** Consider restocking soon',
    inline: false
  });

  const payload: DiscordWebhookPayload = {
    embeds: [embed],
    username: 'Inventory Bot',
    avatar_url: 'https://cdn.discordapp.com/emojis/📊.png'
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000) // 15 second timeout for larger reports
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, await response.text());
      return false;
    }

    console.log(`Global low stock report sent successfully with ${items.length} items`);
    return true;
  } catch (error) {
    console.error('Failed to send global low stock report:', error);
    return false;
  }
}

export async function sendDiscordTestNotification(): Promise<boolean> {
  const testNotification: DiscordNotification = {
    productId: 0,
    productName: 'Test Product',
    sku: 'TEST-001',
    currentStock: 5,
    threshold: 10,
    channel: 'discord',
    dedupeKey: `test-${Date.now()}`
  };

  return await sendDiscordNotification(testNotification);
}

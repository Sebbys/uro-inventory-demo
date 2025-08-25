# Discord Notifications Setup

This guide will help you set up Discord notifications for your inventory management system.

## 🚀 Quick Setup

### 1. Create a Discord Webhook

1. **Open Discord** and navigate to your server
2. **Go to Server Settings** → **Integrations** → **Webhooks**
3. **Click "New Webhook"**
4. **Choose a channel** where you want notifications to appear
5. **Copy the Webhook URL** (it looks like: `https://discord.com/api/webhooks/123456789/abcdef...`)

### 2. Configure Environment Variable

Add your Discord webhook URL to your environment variables:

```bash
# .env.local
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL_HERE
```

### 3. Test the Setup

1. **Start your application**: `npm run dev`
2. **Navigate to the products page**
3. **Look for the "Discord Notifications" card**
4. **Click "Send Test Notification"**
5. **Check your Discord channel** for the test message

## 📋 Features

### Automatic Notifications
- **Low Stock Alerts**: Automatically sent when stock falls below threshold
- **Critical Alerts**: Special formatting for out-of-stock items
- **Deduplication**: Prevents spam by avoiding duplicate notifications

### Manual Notifications
- **Notify Button**: Click to manually send notifications for low stock items
- **Test Button**: Send test notifications to verify setup

### Rich Discord Embeds
- **Color-coded alerts**: Red for critical, orange for low stock
- **Product details**: Name, SKU, current stock, threshold
- **Status indicators**: Clear visual status for stock levels
- **Timestamps**: When the alert was triggered

## 🎨 Message Format

Discord notifications include:

```
🚨 CRITICAL STOCK ALERT
Product Name is completely out of stock!

📦 Product Details
Name: Product Name
SKU: ABC-123

📊 Stock Status
Current: 0 units
Threshold: 10 units

📈 Status
🔴 OUT OF STOCK - Immediate action required!
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DISCORD_WEBHOOK_URL` | Your Discord webhook URL | Yes |

### Customization

You can customize the notification format by editing:
- `src/lib/discord.ts` - Message formatting and colors
- `src/components/ui/notification-button.tsx` - Button behavior
- `src/components/ui/notification-settings.tsx` - Settings UI

## 🛠️ Troubleshooting

### Common Issues

1. **"Discord webhook URL not configured"**
   - Make sure `DISCORD_WEBHOOK_URL` is set in your environment
   - Restart your development server after adding the variable

2. **"Failed to send Discord notification"**
   - Check that your webhook URL is valid
   - Ensure the Discord channel still exists
   - Verify your server has permission to send webhooks

3. **Notifications not appearing**
   - Check Discord channel permissions
   - Verify webhook is still active in Discord
   - Check browser console for errors

### Testing

Use the test button in the notification settings to verify your setup:

1. Click "Send Test Notification"
2. Check your Discord channel
3. Look for a test message with sample data

## 🔒 Security

- **Never commit** your webhook URL to version control
- **Use environment variables** for all sensitive data
- **Regularly rotate** webhook URLs if needed
- **Monitor** webhook usage for unusual activity

## 📊 Monitoring

Track notification activity through:
- **Database logs**: Check `alert_logs` table
- **Application logs**: Console output for errors
- **Discord audit logs**: Server-side webhook activity

## 🚀 Advanced Features

### Custom Webhook Formatting

Edit `src/lib/discord.ts` to customize:
- Message colors and styling
- Embed fields and layout
- Bot username and avatar
- Notification triggers

### Multiple Channels

Support for multiple Discord channels:
- Create multiple webhooks
- Use different channels for different alert types
- Configure channel-specific formatting

### Rate Limiting

Built-in protection against spam:
- 5-second deduplication window
- Automatic duplicate detection
- Configurable rate limits

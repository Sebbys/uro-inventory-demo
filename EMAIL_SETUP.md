# Email Reports Setup with Resend

This guide will help you set up beautiful email reports for your inventory management system using Resend.

## 🚀 Why Resend?

- **Easy Setup**: Simple API with great documentation
- **Beautiful Templates**: Built-in support for React email templates
- **Free Tier**: 3,000 emails/month free
- **Great Deliverability**: Excellent inbox placement
- **TypeScript Support**: Perfect for your Next.js setup
- **React Email**: Use React components for email templates

## 📋 Quick Setup

### 1. Sign Up for Resend

1. **Visit [resend.com](https://resend.com)**
2. **Create a free account**
3. **Verify your email address**
4. **Get your API key** from the dashboard

### 2. Configure Environment Variables

Add your Resend API key to your environment variables:

```bash
# .env.local
RESEND_API_KEY=re_1234567890abcdef...
```

### 3. Update Sender Email

Edit `src/lib/email.ts` and update the sender email:

```typescript
// Change this line in the sendEmailReport function
from: 'Inventory System <your-email@yourdomain.com>',
```

**Note**: You can also customize the email template by editing `src/lib/email-template.tsx`

**Note**: For production, you should:
- Use a verified domain in Resend
- Update the sender to use your domain: `inventory@yourcompany.com`

### 4. Test the Setup

1. **Start your application**: `npm run dev`
2. **Navigate to the products page**
3. **Look for the "Email Reports" card**
4. **Enter an email address and click "Send Email Report"**
5. **Check your email** for the beautiful report

## 📧 Email Report Features

### Beautiful Design
- **Responsive layout** that works on all devices
- **Color-coded sections** for different alert types
- **Professional styling** with modern design
- **Clear typography** and spacing

### Rich Content
- **Summary statistics** with visual indicators
- **Critical items** (out of stock) in red
- **Low stock items** in orange
- **Product details** with SKU and stock levels
- **Direct link** to your inventory dashboard

### Smart Features
- **Deduplication** prevents spam
- **Error handling** with user feedback
- **Loading states** during sending
- **Success confirmation** with timestamps

## 🎨 Email Template Structure

The email template includes:

```
📊 Inventory Report Header
├── Summary Statistics
│   ├── Critical Items (red)
│   ├── Low Stock Items (orange)
│   └── Total Items (blue)
├── Critical Items Table
│   ├── Product Name
│   ├── SKU
│   ├── Stock (0)
│   └── Threshold
├── Low Stock Items Table
│   ├── Product Name
│   ├── SKU
│   ├── Current Stock
│   └── Threshold
├── Action Button
│   └── "View Inventory Dashboard"
└── Footer
    └── System information
```

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `RESEND_API_KEY` | Your Resend API key | Yes |

### Customization

You can customize the email template by editing:
- `src/lib/email-template.tsx` - Email template and styling
- `src/components/ui/email-report-button.tsx` - UI component
- `src/app/api/notifications/email/route.ts` - API endpoint

### Email Template Customization

The email template uses React Email components. You can modify:

```typescript
// Colors and styling
const colors = {
  critical: '#dc2626',
  lowStock: '#f59e0b',
  primary: '#3b82f6'
};

// Layout and spacing
const styles = {
  container: { maxWidth: '600px' },
  header: { backgroundColor: '#dc2626' },
  // ... more styles
};
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Resend API key not configured"**
   - Make sure `RESEND_API_KEY` is set in your environment
   - Restart your development server after adding the variable

2. **"Failed to send email report"**
   - Check that your API key is valid
   - Verify your sender email is configured correctly
   - Check Resend dashboard for any errors

3. **Emails not being received**
   - Check spam/junk folder
   - Verify recipient email address
   - Check Resend dashboard for delivery status

4. **Template rendering issues**
   - Ensure all React Email components are imported
   - Check for any JSX syntax errors
   - Verify the template structure

### Testing

Use the email report button to test your setup:

1. **Click "Send Email Report"**
2. **Enter a test email address**
3. **Check your email inbox**
4. **Verify the report looks correct**

## 🔒 Security Best Practices

- **Never commit** your API key to version control
- **Use environment variables** for all sensitive data
- **Regularly rotate** API keys if needed
- **Monitor** email sending activity
- **Set up domain verification** for production use

## 📊 Monitoring and Analytics

Track email activity through:
- **Resend Dashboard**: Delivery rates, bounces, opens
- **Database logs**: Check `alert_logs` table
- **Application logs**: Console output for errors
- **Email tracking**: Open rates and click tracking

## 🚀 Production Deployment

### Domain Verification

For production, verify your domain in Resend:

1. **Add your domain** in Resend dashboard
2. **Add DNS records** as instructed
3. **Wait for verification** (usually 24-48 hours)
4. **Update sender email** to use your domain

### Rate Limiting

Resend has rate limits:
- **Free tier**: 3,000 emails/month
- **Paid tiers**: Higher limits available
- **Rate limiting**: Per-second limits apply

### Error Handling

The system includes robust error handling:
- **API failures**: Graceful degradation
- **Invalid emails**: User feedback
- **Rate limits**: Automatic retry logic
- **Network issues**: Timeout handling

## 📈 Advanced Features

### Scheduled Reports

You can extend this to send scheduled reports:

```typescript
// Example: Daily report at 9 AM
const schedule = '0 9 * * *'; // Cron expression
// Use a cron job or scheduler service
```

### Multiple Recipients

Support for multiple email addresses:

```typescript
const recipients = ['manager@company.com', 'warehouse@company.com'];
// Send to multiple recipients
```

### Custom Templates

Create different email templates for different use cases:

```typescript
// Weekly summary
// Monthly report
// Critical alerts only
// Full inventory report
```

## 🎯 Next Steps

1. **Set up Resend account** and get API key
2. **Configure environment variables**
3. **Test with your email address**
4. **Customize the template** if needed
5. **Deploy to production** with domain verification

## 📞 Support

- **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
- **React Email**: [react.email](https://react.email)
- **GitHub Issues**: For code-related questions

---

**Happy emailing! 📧✨**

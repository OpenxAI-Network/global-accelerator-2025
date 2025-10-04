# Email Confirmation Troubleshooting Guide

## Why Emails Are Not Being Sent

The most common reasons for email confirmation not working:

### 1. **Supabase Email Configuration**
- **Email confirmations disabled**: Go to Supabase Dashboard > Authentication > Settings
- **Site URL not configured**: Must match your domain exactly
- **Email templates not set up**: Check Authentication > Email Templates

### 2. **SMTP Configuration Issues**
- **Using default Supabase SMTP**: Limited to development, may be blocked
- **Custom SMTP not configured**: Need to set up your own email service
- **Domain not verified**: If using custom SMTP, domain must be verified

### 3. **Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Quick Fix Steps

### Step 1: Check Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Ensure "Enable email confirmations" is **ON**
4. Set Site URL to: `http://localhost:3000` (for development)

### Step 2: Verify Email Templates
1. Go to Authentication > Email Templates
2. Check "Confirm signup" template is enabled
3. Verify the confirmation URL contains: `{{ .ConfirmationURL }}`

### Step 3: Test Email Delivery
1. Check spam/junk folder
2. Try with different email providers (Gmail, Outlook, etc.)
3. Check Supabase logs for email delivery errors

### Step 4: Enable Custom SMTP (Recommended)
1. Go to Authentication > Settings > SMTP Settings
2. Configure with services like:
   - **Resend** (recommended)
   - **SendGrid**
   - **Mailgun**
   - **AWS SES**

## Development vs Production

### Development
- Supabase default SMTP works but may be slow/unreliable
- Emails might go to spam
- Limited sending rate

### Production
- **Must use custom SMTP**
- Configure proper domain authentication
- Set up SPF, DKIM, DMARC records

## Testing Email Configuration

Run this in browser console after signup:
```javascript
// Check if email was sent
console.log('Check Supabase Dashboard > Authentication > Users for new user entry')
```

## Common Error Messages

| Error | Solution |
|-------|----------|
| "Email not confirmed" | Check email and click confirmation link |
| "Invalid confirmation link" | Link expired or malformed - request new one |
| "SMTP configuration error" | Set up custom SMTP in Supabase |
| "Rate limit exceeded" | Wait and try again, or upgrade Supabase plan |

## Immediate Workaround

For development, you can disable email confirmation:
1. Supabase Dashboard > Authentication > Settings
2. Turn OFF "Enable email confirmations"
3. Users will be automatically confirmed

**⚠️ Only use this for development - never in production!**
# Email Configuration Guide for Supabase

This guide covers how to configure email sending for OTP verification in your Deni Loans application.

## Option 1: Supabase Built-in SMTP (Easiest for Testing)

### Step 1: Access Supabase Dashboard
1. Go to [app.supabase.com](https://app.supabase.com)
2. Log in with your account
3. Select your project (Deni Loans)

### Step 2: Configure Email Provider
1. Click **Authentication** in the left sidebar
2. Click **Providers**
3. Click **Email**
4. Under **Email Provider**, select one of the options:
   - **Supabase** (Built-in, limited - good for testing)
   - **Custom SMTP** (Production-grade)
   - **SendGrid** (Recommended for production)
   - **Resend** (Modern alternative, recommended)

### Step 3: Enable OTP
1. Toggle **Email OTP** to **ON**
2. Set **OTP Expiry Duration**: 3600 seconds (1 hour) or your preference
3. Click **Save**

---

## Option 2: Custom SMTP (Best for Control)

### Recommended SMTP Providers:
- **Gmail SMTP** (Free, 500/day limit)
- **SendGrid** (100/day free, then paid)
- **Mailgun** (10,000/month free)
- **AWS SES** (62,000/month free, then paid)

### Using Gmail SMTP:

#### Step 1: Enable Gmail App Passwords
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** (left sidebar)
3. Enable **2-Step Verification** (if not already done)
4. Go back to Security
5. Find **App passwords** (appears only after 2FA is enabled)
6. Select **Mail** and **Windows Computer**
7. Copy the generated 16-character password

#### Step 2: Add to Supabase
1. Go to **Authentication** → **Providers** → **Email**
2. Select **Custom SMTP**
3. Fill in:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `your-email@gmail.com`
   - **SMTP Password**: `your-app-password` (16 chars from step 1)
   - **SMTP Admin Email**: `your-email@gmail.com`
   - **SMTP Max Frequency**: `1` (emails per second)
   - **SMTP Sender Name**: `Deni Loans` or your company name
4. Click **Save**

#### Step 3: Test Email
1. Still in **Authentication** → **Providers** → **Email**
2. Click **Send test email**
3. Enter an email address
4. Check inbox for test email

---

## Option 3: SendGrid (Recommended for Production)

### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Click **Sign up**
3. Fill in your details
4. Verify your email
5. Select **Marketing Campaigns** or **Transactional Email**

### Step 2: Get SendGrid API Key
1. Log in to SendGrid
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it: `Deni Loans Supabase`
5. Select **Restricted Access**
6. Under **Mail Send**, enable:
   - ✅ Full Access to Mail Send
7. Click **Create & Verify**
8. Copy the API key (you won't see it again!)

### Step 3: Verify Sender Email
1. In SendGrid, go to **Settings** → **Sender Authentication**
2. Click **Authenticate your domain** (recommended for production)
   - OR **Single Sender Verification** (faster for testing)
3. For Single Sender:
   - Enter your email: `noreply@deniloan.com` or similar
   - Click **Create**
   - Check your email for verification link
   - Verify sender

### Step 4: Add to Supabase
1. Go to **Authentication** → **Providers** → **Email**
2. Under **Email Provider**, select **SendGrid**
3. Fill in:
   - **SendGrid API Key**: (paste your API key from step 2)
   - **SMTP Sender Name**: `Deni Loans`
   - **SMTP Admin Email**: `your-email@sendgrid.com`
4. Click **Save**

### Step 5: Test Email
1. Go to **Authentication** → **Providers** → **Email**
2. Click **Send test email**
3. Enter an email address
4. Check inbox for test email

---

## Option 4: Resend (Modern, Recommended Alternative)

### Step 1: Create Resend Account
1. Go to [resend.com](https://resend.com)
2. Click **Sign up**
3. Fill in your details
4. Verify your email

### Step 2: Get Resend API Key
1. Log in to Resend
2. Go to **API Keys**
3. Click **Create API Key**
4. Name it: `Deni Loans`
5. Copy the key

### Step 3: Verify Sender Email (If needed)
1. By default, you can send from `onboarding@resend.dev`
2. To use your own domain:
   - Go to **Domains**
   - Click **Add Domain**
   - Enter your domain: `deniloan.com`
   - Add DNS records (shown in dashboard)
   - Wait for verification

### Step 4: Add to Supabase
1. Go to **Authentication** → **Providers** → **Email**
2. Under **Email Provider**, select **Custom SMTP**
3. Fill in:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `465`
   - **SMTP User**: `resend`
   - **SMTP Password**: (your Resend API key)
   - **SMTP Admin Email**: `your-email@resend.com`
   - **SMTP Sender Name**: `Deni Loans`
4. Click **Save**

### Step 5: Test Email
1. Go to **Authentication** → **Providers** → **Email**
2. Click **Send test email**
3. Enter an email address
4. Check inbox for test email

---

## Comparison Table

| Provider | Setup Time | Cost | Free Tier | Best For |
|----------|-----------|------|-----------|----------|
| **Supabase Built-in** | 5 min | Free | Limited | Testing only |
| **Gmail SMTP** | 10 min | Free | 500/day | Small projects |
| **SendGrid** | 20 min | Free | 100/day | Production |
| **Resend** | 15 min | Free | Unlimited* | Modern projects |
| **Mailgun** | 20 min | Free | 10,000/mo | High volume |

*Resend: Unlimited from `onboarding@resend.dev`, custom domain is paid

---

## Customizing Email Templates

After choosing a provider, customize the OTP email template:

### Step 1: Go to Email Templates
1. **Authentication** → **Providers** → **Email**
2. Scroll to **Email Templates**
3. Click **Edit Template** next to "Confirm signup"

### Step 2: Customize Template
Available variables:
- `{{ .ConfirmationURL }}` - Link to confirm email
- `{{ .TokenHash }}` - Verification token
- `{{ .RedirectTo }}` - Redirect URL
- `{{ .SiteURL }}` - Your site URL
- `{{ .Email }}` - User's email

### Example Template:
```html
<body>
  <h2>Verify Your Email</h2>
  <p>Hi there!</p>
  <p>Your verification code is: <strong>{{ .Token }}</strong></p>
  <p>This code expires in 24 hours.</p>
  <p>If you didn't request this, you can ignore this email.</p>
  <p>Best regards,<br/>Deni Loans Team</p>
</body>
```

### Step 3: Save Template
Click **Save Template**

---

## Troubleshooting

### Problem: "Email not sent"
**Solutions**:
- [ ] Verify email provider is enabled in Supabase
- [ ] Check SMTP credentials are correct
- [ ] For Gmail: Ensure App Password is used (not regular password)
- [ ] For SendGrid: Verify sender email is verified
- [ ] For Resend: Ensure API key is correct

### Problem: "Email arrives but code is wrong"
**Solutions**:
- [ ] Check email template for `{{ .Token }}` variable
- [ ] Ensure OTP type is set to `email` in your code
- [ ] Verify token expiry time in Supabase settings

### Problem: "Emails going to spam"
**Solutions**:
- [ ] Set up SPF records for your domain
- [ ] Set up DKIM records
- [ ] Set up DMARC policy
- [ ] Use authenticated domain (not `onboarding@resend.dev`)
- [ ] Include unsubscribe link in template
- [ ] For SendGrid/Resend: Authenticate your domain

### Problem: Rate limiting errors
**Solutions**:
- [ ] Increase SMTP Max Frequency in settings
- [ ] Use reputable email service (not Gmail for production)
- [ ] Implement client-side rate limiting (resend cooldown)

---

## Testing Your Setup

### Step 1: Test in Dashboard
1. Go to **Authentication** → **Providers** → **Email**
2. Click **Send test email**
3. Enter your email
4. Check inbox for test email (check spam folder too)

### Step 2: Test Full Sign-Up Flow
1. Go to your app: `http://localhost:3001`
2. Click **Sign Up**
3. Fill in form with test email
4. Click **Create Account**
5. Should redirect to `/verify-email`
6. Check email for verification code
7. Enter code on verification page
8. Should see success screen
9. Should redirect to dashboard

### Step 3: Test Resend
1. Don't check email for 60 seconds
2. Click **Resend Code**
3. Should receive new code
4. Use new code to verify

---

## Production Checklist

Before going live, ensure:

- [ ] Email provider configured (not Supabase built-in)
- [ ] Sender email is verified and branded
- [ ] Email templates customized with your logo/branding
- [ ] Domain authenticated (SPF/DKIM/DMARC records added)
- [ ] Rate limiting configured appropriately
- [ ] Test emails received reliably
- [ ] Full sign-up flow tested end-to-end
- [ ] Emails not going to spam
- [ ] Error messages display correctly
- [ ] Resend functionality works

---

## Quick Start Recommendation

For fastest setup right now:

### Immediate (Testing):
1. Use **Supabase Built-in** email
2. Go to Authentication → Providers → Email
3. Select "Email" provider
4. Toggle **Email OTP** ON
5. Click **Save**
6. Test with sign-up flow

### Soon (Before Production):
1. Set up **SendGrid** or **Resend**
2. Get API key
3. Configure in Supabase
4. Verify sender email
5. Test again
6. Deploy

---

## Environment Variables (If Needed)

Most email configuration is done in Supabase dashboard, but if using Edge Functions:

```env
# .env.local
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Optional for custom email service
SENDGRID_API_KEY=your_sendgrid_key
RESEND_API_KEY=your_resend_key
```

---

## Next Steps

1. **Choose a provider** (recommendation: SendGrid for production)
2. **Set up account** (5-10 minutes)
3. **Configure in Supabase** (2-5 minutes)
4. **Test with sign-up** (5 minutes)
5. **Customize email template** (optional, 5-10 minutes)
6. **Deploy to production** (ready!)

---

**Need help?** Check Supabase documentation:
- https://supabase.com/docs/guides/auth/auth-email-otp
- https://supabase.com/docs/guides/auth/auth-smtp


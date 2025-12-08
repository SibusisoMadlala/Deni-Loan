# Fix: Gmail SMTP Configuration for Supabase Email Verification

## Problem

Emails not being sent even though SMTP is configured. This is because Gmail requires **App Passwords** for third-party applications, not your regular Gmail password.

## Current Configuration (Issue)

```
Host: smtp.gmail.com
Port: 465
Username: sibumadlala03@gmail.com
Password: [Your Gmail Password] ← ❌ WRONG!
Sender Email: sibumadlala03@gmail.com
```

**Problem**: Gmail rejects regular passwords for third-party apps like Supabase.

## Solution: Use Gmail App Password

### Step 1: Enable 2-Factor Authentication (if not already done)

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Click **Security** (left sidebar)
3. Look for **2-Step Verification**
4. If not enabled, click **Enable 2-Step Verification**
   - Follow the steps to set up 2FA with your phone
   - Choose phone call or authenticator app

### Step 2: Generate App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select:
   - **App**: Mail
   - **Device**: Windows Computer (or your device type)
3. Click **Generate**
4. Google will show a **16-character password** in yellow box
   - ✅ Copy this password (you won't see it again!)
   - Format: `xxxx xxxx xxxx xxxx` (with spaces)

### Step 3: Update Supabase SMTP Settings

1. Go to **[app.supabase.com](https://app.supabase.com)**
2. Select your project
3. **Authentication** → **Providers** → **Email**
4. Under "SMTP provider settings", update:

**Old Settings (❌ Not Working)**:
```
Host: smtp.gmail.com
Port: 465
Username: sibumadlala03@gmail.com
Password: [Your Gmail password]
```

**New Settings (✅ Correct)**:
```
Host: smtp.gmail.com
Port: 587  ← Change from 465 to 587 for Gmail
Username: sibumadlala03@gmail.com
Password: xxxx xxxx xxxx xxxx  ← Paste the 16-char App Password here (remove spaces)
```

**Important**: 
- Remove the **spaces** in the app password (e.g., `xxxxxxxxxxxxxx` not `xxxx xxxx xxxx xxxx`)
- Use **Port 587** instead of 465 for Gmail with TLS
- Keep username as your full email

### Step 4: Test Email

1. After saving, click **Send test email**
2. Enter a test email address
3. Check inbox for test email (check spam folder too)
4. If received ✅, configuration is working!

## Complete Gmail SMTP Configuration

```
Enable custom SMTP: ✅ ON

Sender details:
  Sender email address: sibumadlala03@gmail.com
  Sender name: Deni Loans (or your preference)

SMTP provider settings:
  Host: smtp.gmail.com
  Port: 587
  Username: sibumadlala03@gmail.com
  Password: [16-character App Password without spaces]
  
Email rate limiting:
  Minimum interval per user: 60 seconds (good default)
```

## Troubleshooting

### "Cannot send emails" or "Still not receiving"

**Check 1: App Password is Correct**
- Did you copy it from the yellow box?
- Did you remove the spaces? (should be `xxxxxxxxxxxxxx`)
- Did you paste it completely? (16 characters)

**Check 2: 2FA is Enabled**
- Go to [myaccount.google.com/security](https://myaccount.google.com/security)
- Verify "2-Step Verification" shows as ON
- If OFF, enable it first, then generate app password

**Check 3: Port is Correct**
- Gmail SMTP uses Port **587** (not 465)
- 465 is for older SSL-only connections
- 587 is for TLS (what Gmail prefers)

**Check 4: Send Test Email**
- In Supabase, click "Send test email"
- Enter a test email you can access
- Check both inbox AND spam folder

### "Gmail rejected the password"

**Solution**: 
- You're using your regular Gmail password
- Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Generate a NEW App Password
- Use that instead (16 characters)

### "Login credentials invalid"

**Solution**:
- Make sure you're using the App Password, not regular password
- Check spelling of email address exactly matches
- Verify no extra spaces in password

## Gmail Security Note

✅ Using App Password is more secure than regular password because:
- It's a unique password just for this app
- You can revoke it anytime
- It doesn't expose your main Gmail password
- If compromised, you can delete just this password

## Alternative: Use Better Email Service

If Gmail continues to have issues, consider:

### Option A: SendGrid (Recommended for Production)
- More reliable for transactional emails
- Built for developer integrations
- Better deliverability

**Setup**:
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. In Supabase, select **SendGrid** as provider
4. Paste API key
5. Verify sender email

### Option B: Resend
- Modern email service
- Better interface
- DKIM/SPF setup easier

**Setup**:
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. In Supabase, select **Custom SMTP**
4. Use Resend SMTP settings

## Current Gmail Setup Summary

Your setup is **almost correct**, just needs:
1. ✅ `Host: smtp.gmail.com` - Correct
2. ❌ `Port: 465` - Change to **587**
3. ❌ `Password: [Gmail password]` - Change to **App Password**
4. ✅ `Username: sibumadlala03@gmail.com` - Correct
5. ✅ `Sender: sibumadlala03@gmail.com` - Correct

## Testing Steps

After updating with App Password:

1. **Save changes** in Supabase
2. **Send test email** to your personal email
3. **Check inbox** (wait 1-2 minutes)
4. **Check spam folder** if not in inbox
5. Try **signing up** and see if OTP email arrives
6. Try **resend code** and see if new OTP arrives

## Status

- [ ] Enable 2FA on Gmail (if not done)
- [ ] Generate App Password from [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- [ ] Update Supabase Port to **587**
- [ ] Update Supabase Password to **16-char App Password** (no spaces)
- [ ] Save changes
- [ ] Send test email
- [ ] Verify email received
- [ ] Test full signup flow

---

**Key Change**: Use Gmail App Password (16 chars) instead of regular Gmail password!


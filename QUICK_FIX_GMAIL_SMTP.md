# Quick: Fix Gmail SMTP - Email Not Sending

## The Issue
✉️ Emails not being sent for OTP verification

## The Fix (3 minutes)

### Step 1: Get Gmail App Password (2 min)
1. Go to: https://myaccount.google.com/apppasswords
2. Select: **Mail** + **Windows Computer**
3. Click **Generate**
4. **Copy** the 16-character password shown
   - Remove spaces: `xxxxxxxxxxxxxx` (no `xxxx xxxx xxxx xxxx`)

### Step 2: Update Supabase Settings (1 min)
1. Go to: https://app.supabase.com
2. Your project → **Authentication** → **Providers** → **Email**
3. Update these fields:
   ```
   Port: 587  (change from 465)
   Password: [paste the 16-char App Password]
   ```
4. Click **Save**

### Step 3: Test (1 min)
1. Click **"Send test email"**
2. Enter your email address
3. Check inbox (or spam folder)
4. Should receive test email ✅

## Complete Gmail SMTP Config

```
✅ Enable custom SMTP: ON
✅ Sender email: sibumadlala03@gmail.com
✅ Sender name: Admin
✅ Host: smtp.gmail.com
✅ Port: 587 (must be 587, not 465!)
✅ Username: sibumadlala03@gmail.com
✅ Password: [16-char App Password - no spaces]
✅ Minimum interval: 60 seconds
```

## Key Points

❌ **Don't Use**: Your regular Gmail password
✅ **Use**: 16-character App Password from [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

❌ **Don't Use**: Port 465
✅ **Use**: Port 587

❌ **Don't Keep**: Spaces in password
✅ **Do Remove**: Spaces (`xxxx xxxx` → `xxxxxxxxxxxxxx`)

## Test Sign-Up Flow

After fixing SMTP:
1. Go to `/signup`
2. Create account
3. Should redirect to `/verify-email`
4. Check email for **6-digit code** ✅
5. Enter code and verify
6. Access dashboard ✅

## Still Not Working?

1. Verify 2-Step Verification is ON
   - Go: [myaccount.google.com/security](https://myaccount.google.com/security)
   - Look for "2-Step Verification"
2. Generate NEW App Password
   - Old one might be wrong
3. Send test email in Supabase
   - Check spam folder too
4. Check Supabase logs for errors

## Alternative: Use SendGrid

If Gmail continues to fail:
1. Sign up: [sendgrid.com](https://sendgrid.com)
2. Get API key
3. In Supabase: Select **SendGrid** (not Custom SMTP)
4. Paste API key
5. Done!

---

**Main Fix**: Use App Password + Port 587!


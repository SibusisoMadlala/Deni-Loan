# Quick Fix: "Email Not Confirmed" Error

## The Error
```
Email not confirmed
```

When trying to login after signup.

## Immediate Fix (Do This First)

1. Go to **[app.supabase.com](https://app.supabase.com)**
2. Select your **Deni Loans** project
3. Click **Authentication** in the left sidebar
4. Click **Providers**
5. Click **Email**
6. Find the toggle that says **"Require email verification"** or similar
7. **Turn it OFF** (disable it)
8. Click **Save**

That's it! Now users can login and verify their email.

## What the Code Now Does

Even if you can't change that setting, the code handles it:

1. **Sign Up** → Creates user with unconfirmed email
2. **Try to Login** → Supabase returns "email not confirmed" error
3. **Code Catches This** → Redirects to `/verify-email` automatically
4. **User Verifies Email** → Enters 6-digit code
5. **Can Now Login** → After email confirmed

## Test It

### Test Case 1: Sign Up Fresh
1. Go to `/signup`
2. Fill form → Click "Create Account"
3. Should go to `/verify-email`
4. Enter 6-digit code from email
5. Should go to dashboard ✅

### Test Case 2: Login with Unconfirmed Email
1. Sign up but don't verify
2. Close browser
3. Go to `/login`
4. Enter email + password
5. Should auto-redirect to `/verify-email` (instead of error)
6. Verify and login normally ✅

## If Still Getting Error

### Check Dashboard Setting
- Open **Supabase Dashboard**
- **Authentication** → **Providers** → **Email**
- Look for "Require email verification" option
- Make sure it's **OFF**

### Check Email Inbox
- Look for email with subject "Verify your email"
- Find the 6-digit code (NOT a link)
- Enter code on `/verify-email` page

### Clear Cache
- Press **Ctrl+Shift+Delete** (Windows) or **Cmd+Shift+Delete** (Mac)
- Clear browser cache
- Try again

## Files Changed

1. `src/hooks/useAuth.ts` - Handles email not confirmed error
2. `src/components/LoginPage.tsx` - Redirects to verification
3. `src/supabase/functions/server/index.tsx` - Sends OTP on signup

## Status

✅ Code changes complete - no errors
✅ Handles both confirmed and unconfirmed emails
✅ Automatic redirect to verification
✅ Ready to test

**Next**: Go to Supabase dashboard and disable the email verification requirement!


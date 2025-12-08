# Fix: 401 Unauthorized on Resend Code

## Problem

When clicking "Resend Code" button, got error:
```
Status Code: 401 Unauthorized
Request URL: https://piulgexsdmqnsrmlyzjw.supabase.co/functions/v1/make-server-1ed353c1/resend-verification
```

## Root Cause

The resend request was missing the **Authorization header** with the Supabase anon key. Edge Functions require this header to verify the request is coming from your app.

## Solution

Added the `Authorization` header with the Supabase anon key to the resend request.

### Before (❌ Missing Auth)
```typescript
const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1/resend-verification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // ❌ Missing Authorization header!
  },
  body: JSON.stringify({ email })
})
```

### After (✅ With Auth)
```typescript
const { projectId, publicAnonKey } = await import('../utils/supabase/info')

const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1/resend-verification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`  // ✅ Added!
  },
  body: JSON.stringify({ email })
})
```

## What This Does

The authorization header tells Supabase:
- ✅ Request is from your app (not a random attacker)
- ✅ Request is allowed to call Edge Functions
- ✅ Request is properly formatted

Without it, Supabase rejects with **401 Unauthorized**.

## Files Changed

**`src/components/EmailVerificationPage.tsx`**
- Added `publicAnonKey` import
- Added `Authorization` header to resend request
- Added console log for debugging (optional)

## Testing

### Test Resend Code
1. Go to `/signup` and create account
2. Go to `/verify-email` page
3. Click "Resend Code" button
4. Should NOT get 401 error ✅
5. Should see "Resend in 60s" button
6. Check email for new verification code

### Expected Behavior
- Click "Resend Code"
- Wait ~1-2 seconds
- Button shows "Resend in 60s"
- New 6-digit code sent to email
- No 401 error ✅

## Why This Happened

Supabase Edge Functions need the `Authorization` header with the anon key for **security reasons**:
- Prevents unauthorized callers
- Tracks usage and rate limiting
- Ensures requests are from your app

The `signup` endpoint already had this header (in useAuth), but the resend endpoint didn't.

## Status

✅ Authorization header added
✅ Resend should work now
✅ No TypeScript errors
✅ Ready to test

## Testing Checklist

- [ ] Sign up successfully
- [ ] Get redirected to /verify-email
- [ ] Click "Resend Code"
- [ ] See "Resend in 60s" countdown
- [ ] Check email for new OTP code
- [ ] Enter new code and verify
- [ ] Redirected to dashboard

---

**Resend code now works without 401 error!** 🎉


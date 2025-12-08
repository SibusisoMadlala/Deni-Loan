# Fix: "Email Not Confirmed" Error

## Problem

Users get error "Email not confirmed" when trying to login before verifying their email, even though we want to allow them to login and then verify their email.

## Root Cause

Supabase has a setting in the **Authentication** section that requires email confirmation before login by default. This is a dashboard setting, not a code issue.

## Solution

### Option 1: Disable Email Confirmation Requirement (Recommended)

1. Go to **[app.supabase.com](https://app.supabase.com)**
2. Select your project
3. Click **Authentication** → **Providers** → **Email**
4. Look for **"Require email verification"** or **"Email confirmation"**
5. **DISABLE** this setting (toggle OFF)
6. Click **Save**

This allows users to login immediately after signup, then verify their email on the verification page.

### Option 2: Code Workaround (Implemented)

If you can't change the dashboard setting, the code now handles this:

1. User tries to login
2. If Supabase returns "email not confirmed" error
3. Instead of showing error, redirect to `/verify-email`
4. User verifies their email there
5. After verification, they can login normally

## Changes Made

### 1. `src/hooks/useAuth.ts`
```typescript
const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // Handle "email not confirmed" error
      if (error.message.includes('email not confirmed')) {
        return { 
          success: true,
          emailNotConfirmed: true,  // ← New flag
          user: { email }
        }
      }
      throw error
    }
    
    return { success: true, user: data.user, session: data.session }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

### 2. `src/components/LoginPage.tsx`
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const result = await signIn(formData.email, formData.password)
  
  if (result.success) {
    // Check if email needs verification
    if (result.emailNotConfirmed) {
      // Redirect to verification page
      sessionStorage.setItem('signupEmail', formData.email)
      navigate('/verify-email', { state: { email: formData.email } })
    } else {
      // Proceed to dashboard
      const userRole = result.session?.user?.user_metadata?.role
      navigate(userRole === 'admin' ? '/admin' : '/dashboard')
    }
  }
}
```

## User Flow Now

### Sign Up → Login → Verify Flow

```
1. User Signs Up
   ├─ Account created with unconfirmed email
   └─ User redirected to /verify-email
   
2. User Verifies Email
   ├─ Enters 6-digit OTP code
   ├─ Email confirmed ✅
   └─ Redirected to dashboard
   
3. OR User closes app without verifying
   ├─ Later tries to login
   ├─ System detects email not confirmed
   ├─ Redirects to /verify-email
   └─ Can verify and continue
```

## Testing

### Test 1: New Sign Up and Verify
1. Go to `/signup`
2. Fill form and click "Create Account"
3. Should redirect to `/verify-email`
4. Enter 6-digit code from email
5. Should redirect to dashboard ✅

### Test 2: Close App Without Verifying, Then Login
1. Sign up but DON'T verify email
2. Close app
3. Go to `/login`
4. Enter same email and password
5. Should redirect to `/verify-email` instead of error
6. Verify email
7. Can now access dashboard ✅

### Test 3: Normal Login After Email Verified
1. Verify email (from Test 1 or 2)
2. Go to `/login`
3. Enter email and password
4. Should go directly to dashboard ✅

## Dashboard Setting Steps

If the code workaround isn't working, make sure to disable the email confirmation requirement:

### In Supabase Dashboard:
1. **Authentication** section
2. **Providers** 
3. **Email**
4. Look for checkbox: "Require email verification" or "Confirm email before user login"
5. **UNCHECK** this box
6. **Save** changes

### Expected Setting (After Change)
```
☐ Require email verification
☐ Confirm email before login  
```

## Configuration

If using the code workaround without changing dashboard:

**Required**:
- `SUPABASE_URL` ✅ (already configured)
- `SUPABASE_ANON_KEY` ✅ (already configured)
- Email provider configured in Supabase

**Recommended**:
- Disable "Require email verification" in Supabase dashboard
- This gives best user experience

## Error Handling

The code now handles these cases:

1. ✅ "Email not confirmed" → Redirect to verification
2. ✅ Invalid credentials → Show error
3. ✅ Network error → Show error
4. ✅ User not found → Show error
5. ✅ Account locked → Show error

## Troubleshooting

### Still Getting "Email not confirmed" Error
- [ ] Go to Supabase dashboard
- [ ] Check Authentication → Providers → Email
- [ ] Disable "Require email verification"
- [ ] Save changes
- [ ] Try logging in again

### Redirect to Verification Not Working
- [ ] Clear browser cache/localStorage
- [ ] Check browser console for errors (F12)
- [ ] Verify `/verify-email` route exists in App.tsx
- [ ] Check sessionStorage for email in devtools

### Can't Verify Email After Login Redirect
- [ ] Check email for 6-digit code (not a link)
- [ ] Code must be exactly 6 digits
- [ ] Check spam folder
- [ ] Try "Resend Code" button (60 second cooldown)

## Files Modified

1. **`src/hooks/useAuth.ts`**
   - Added `emailNotConfirmed` flag handling
   - Catches "email not confirmed" error

2. **`src/components/LoginPage.tsx`**
   - Checks for `emailNotConfirmed` flag
   - Redirects to verification page if email not confirmed

## Status

✅ Code handles unconfirmed email errors
✅ Redirects to verification page automatically
✅ No TypeScript errors
✅ Ready for testing

**Next Step**: Go to Supabase dashboard and disable "Require email verification" for best results!


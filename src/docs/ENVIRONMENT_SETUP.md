# Environment Variables Setup Guide

## Quick Start

### Local Development

1. Create `.env.local` in your project root:

```env
# Experian API Credentials
EXPERIAN_CLIENT_ID=your_client_id_here
EXPERIAN_CLIENT_SECRET=your_client_secret_here
EXPERIAN_USERNAME=your_username_here
EXPERIAN_PASSWORD=your_password_here
```

2. The Vite dev server will automatically load these

### Supabase Edge Functions (Production)

#### Method 1: Using Supabase CLI

```bash
# Set each secret
supabase secrets set EXPERIAN_CLIENT_ID="your_client_id"
supabase secrets set EXPERIAN_CLIENT_SECRET="your_client_secret"
supabase secrets set EXPERIAN_USERNAME="your_username"
supabase secrets set EXPERIAN_PASSWORD="your_password"

# Verify they're set
supabase secrets list
```

#### Method 2: Supabase Dashboard

1. Open Supabase Dashboard
2. Select your project
3. Go to **Settings → Edge Functions**
4. Scroll to **Environment Variables**
5. Add each variable:
   - `EXPERIAN_CLIENT_ID`
   - `EXPERIAN_CLIENT_SECRET`
   - `EXPERIAN_USERNAME`
   - `EXPERIAN_PASSWORD`
6. Click **Save**

#### Method 3: Deploy with Secrets

```bash
# Deploy with secrets inline
supabase functions deploy make-server-1ed353c1 \
  --env EXPERIAN_CLIENT_ID=your_client_id \
  --env EXPERIAN_CLIENT_SECRET=your_client_secret \
  --env EXPERIAN_USERNAME=your_username \
  --env EXPERIAN_PASSWORD=your_password
```

## Environment Variables Reference

| Variable | Description | Example | Required |
|---|---|---|---|
| `EXPERIAN_CLIENT_ID` | OAuth2 client ID from Experian | `abc123xyz` | Yes* |
| `EXPERIAN_CLIENT_SECRET` | OAuth2 client secret | `secret_xyz789` | Yes* |
| `EXPERIAN_USERNAME` | Service account username | `your_username@experian.co.za` | Yes* |
| `EXPERIAN_PASSWORD` | Service account password | `YourPassword123!` | Yes* |

*Required only if using real Experian API. Without them, the system uses mock data.

## Testing Configuration

### Verify Environment Variables Are Loaded

Add this temporary test endpoint to `index.tsx`:

```typescript
app.get('/make-server-1ed353c1/check-config', async (c) => {
  const hasExperian = 
    !!Deno.env.get('EXPERIAN_CLIENT_ID') &&
    !!Deno.env.get('EXPERIAN_CLIENT_SECRET') &&
    !!Deno.env.get('EXPERIAN_USERNAME') &&
    !!Deno.env.get('EXPERIAN_PASSWORD');

  return c.json({
    esperianConfigured: hasExperian,
    clientIdSet: !!Deno.env.get('EXPERIAN_CLIENT_ID'),
    clientSecretSet: !!Deno.env.get('EXPERIAN_CLIENT_SECRET'),
    usernameSet: !!Deno.env.get('EXPERIAN_USERNAME'),
    passwordSet: !!Deno.env.get('EXPERIAN_PASSWORD')
  });
});
```

Then test: `curl http://localhost:3000/check-config`

### Mock vs Real Detection

The system automatically detects which to use:

```typescript
const hasExperianCredentials = 
  Deno.env.get('EXPERIAN_CLIENT_ID') &&
  Deno.env.get('EXPERIAN_CLIENT_SECRET') &&
  Deno.env.get('EXPERIAN_USERNAME') &&
  Deno.env.get('EXPERIAN_PASSWORD');

if (hasExperianCredentials) {
  // Use real Experian API
} else {
  // Use mock data
}
```

## Common Issues

### Issue: "Missing Experian credentials" Error

**Problem**: App throws error about missing credentials

**Solution**: 
- Credentials are optional - if not set, mock is used
- If you want to use Experian, ensure ALL 4 are set
- Check `supabase secrets list` to verify they're saved

### Issue: Credentials Work Locally but Not in Production

**Problem**: Mock data used locally, but want Experian in production

**Solution**:
1. Add secrets to Supabase Dashboard (doesn't affect local)
2. Deploy with `supabase functions deploy`
3. Secrets from dashboard are used in Edge Function

### Issue: Can't See Secrets in Dashboard

**Problem**: Can't find Environment Variables section

**Solution**:
1. Ensure you're logged into correct project
2. Go to Settings (gear icon in sidebar)
3. Look for "Edge Functions" in Settings
4. Scroll down for "Environment Variables"

### Issue: Changes to Environment Variables Not Taking Effect

**Problem**: Updated secrets but still getting old behavior

**Solution**:
1. Redeploy the function: `supabase functions deploy`
2. Wait 1-2 minutes for changes to propagate
3. Restart your local dev server: `npm run dev`

## Development Workflow

### Local Testing (Mock Data)

No configuration needed! Just run:

```bash
npm run dev
```

The system automatically uses mock data.

### Local Testing (Real Experian)

1. Create `.env.local` with Experian credentials
2. Restart dev server: `npm run dev`
3. Check console: Should see `✅ Real Experian credit check completed`

### Staging/Production (Real Experian)

1. Set secrets in Supabase Dashboard
2. Deploy: `supabase functions deploy`
3. Test with: `supabase functions list`

## Security Best Practices

### ✅ DO

- Use environment variables for all secrets
- Rotate credentials regularly
- Use strong passwords for Experian account
- Enable 2FA on Experian account
- Limit API key scope if available
- Audit access logs regularly

### ❌ DON'T

- Commit `.env` files to git
- Share credentials via email
- Use development credentials in production
- Log sensitive data
- Hard-code credentials in source code
- Use same credentials for multiple services

## Git Configuration

### Prevent Accidental Commits

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
.env.production
```

### Use Git Hooks (Optional)

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
if git diff --cached | grep -E "EXPERIAN_(CLIENT_ID|CLIENT_SECRET|USERNAME|PASSWORD)"; then
  echo "ERROR: Found Experian credentials in commit!"
  exit 1
fi
```

Make executable: `chmod +x .git/hooks/pre-commit`

## Deployment Checklist

- [ ] All 4 Experian environment variables set in Supabase
- [ ] Variables tested with `supabase secrets list`
- [ ] Credit check endpoint tested in staging
- [ ] Response format verified (real vs mock)
- [ ] Error handling tested (network failure, API down)
- [ ] Fallback to mock tested
- [ ] Logging verified for troubleshooting
- [ ] Performance acceptable (< 5s response time)
- [ ] Security review completed
- [ ] Documentation updated

## References

- [Supabase Environment Variables](https://supabase.com/docs/guides/edge-functions/secrets)
- [Experian API Documentation](https://developer.experian.com/)
- [Deno Environment Variables](https://docs.deno.com/runtime/manual/basics/env_variables)

## Support

If you need help:
1. Check this guide's troubleshooting section
2. Review console logs for error messages
3. Contact Experian support for API issues
4. Check Supabase status page for service issues

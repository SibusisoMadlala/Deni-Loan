# Experian API Integration Guide

## Overview

This document provides complete instructions for integrating the real Experian API into your Deni-Loan application. The system intelligently falls back to mock data if Experian credentials are not configured.

## Architecture

```
┌─────────────────────────────────────┐
│     Frontend (React Component)       │
│  - Calls performCreditCheck()        │
│  - Displays results to user          │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  Backend (Hono Edge Function)       │
│  - /credit-check endpoint            │
│  - Routes to Experian or mock        │
└─────────────────────────────────────┘
                  ↓
         ┌────────┴────────┐
         ↓                 ↓
   ┌──────────┐      ┌──────────┐
   │ Experian │      │   Mock   │
   │   API    │      │ Generator│
   └──────────┘      └──────────┘
```

## Getting Experian Credentials

### 1. Create Experian Account

Visit [Experian South Africa](https://www.experian.co.za/) and:
- Contact their B2B sales team
- Request API access for credit risk assessment and identity verification
- Provide company details and use case

### 2. Obtain Credentials

After approval, you'll receive:
- **Client ID** - OAuth2 client identifier
- **Client Secret** - OAuth2 client secret
- **Username** - Service account username
- **Password** - Service account password

### 3. Endpoints

Experian provides several endpoints:
- **Token Endpoint**: `https://api.experian.co.za/oauth2/v1/token`
- **Credit Check**: `https://api.experian.co.za/creditrisk/v2/bureaucreditcheck`
- **Identity Verification**: `https://api.experian.co.za/verification/v1/identityverification`

## Configuration

### Environment Variables

Add these to your Supabase Edge Function secrets:

```bash
EXPERIAN_CLIENT_ID=your_client_id_here
EXPERIAN_CLIENT_SECRET=your_client_secret_here
EXPERIAN_USERNAME=your_username_here
EXPERIAN_PASSWORD=your_password_here
```

#### How to Set Environment Variables in Supabase

1. Go to **Supabase Dashboard**
2. Select your project
3. Navigate to **Settings → Edge Functions**
4. Scroll to **Environment Variables** section
5. Add each variable with its value
6. Click "Save"

Or use the CLI:

```bash
supabase secrets set EXPERIAN_CLIENT_ID="your_value"
supabase secrets set EXPERIAN_CLIENT_SECRET="your_value"
supabase secrets set EXPERIAN_USERNAME="your_value"
supabase secrets set EXPERIAN_PASSWORD="your_value"
```

### Running Locally

Create a `.env.local` file in your project root:

```env
EXPERIAN_CLIENT_ID=your_client_id_here
EXPERIAN_CLIENT_SECRET=your_client_secret_here
EXPERIAN_USERNAME=your_username_here
EXPERIAN_PASSWORD=your_password_here
```

## API Integration

### 1. Experian Service (`experianService.ts`)

The service handles:
- OAuth2 token management (auto-refresh)
- Credit check API calls
- Identity verification
- Affordability calculations
- Credit risk assessment

#### Key Methods

```typescript
// Perform credit check
const creditCheckResponse = await experianService.performCreditCheck({
  idNumber: "8001015009087",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1980-01-01",
  consent: true
});

// Verify identity
const identityResponse = await experianService.verifyIdentity({
  idNumber: "8001015009087",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1980-01-01"
});

// Calculate affordability
const affordability = ExperianService.calculateAffordability(
  monthlyIncome: 8000,
  existingMonthlyObligations: 1000,
  requestedLoanAmount: 2000
);

// Determine credit risk
const risk = ExperianService.determineCreditRisk(720); // Returns 'good'
```

### 2. Backend Endpoint

The `/credit-check` endpoint:
- Accepts user personal and financial information
- Calls Experian API if credentials are configured
- Falls back to mock data if Experian unavailable
- Returns standardized CreditReport

#### Request

```typescript
POST /make-server-1ed353c1/credit-check
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "idNumber": "8001015009087",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-01-01",
  "income": 8000,
  "existingDebts": 1000
}
```

#### Response

```typescript
{
  "creditReport": {
    "id": "uuid",
    "idNumber": "8001015009087",
    "creditScore": 720,
    "creditRisk": "good",
    "disposableIncome": 7000,
    "maxLoanAmount": 4000,
    "existingObligations": 1000,
    "approved": true,
    "reason": "Meets affordability requirements",
    "source": "experian",
    "numberOfAccounts": 3,
    "defaultedAccounts": 0,
    "judgments": 0,
    "administrationOrders": 0,
    "checkedAt": "2025-11-17T10:30:00.000Z"
  }
}
```

### 3. Frontend Integration

Update your component to pass additional fields:

```typescript
// Before (mock)
const creditReport = await loanService.performCreditCheck(
  idNumber,
  income,
  existingDebts,
  accessToken
);

// After (with Experian)
const creditReport = await loanService.performCreditCheck(
  idNumber,
  income,
  existingDebts,
  accessToken,
  firstName,
  lastName,
  dateOfBirth
);
```

## Credit Check Logic

### Approval Criteria

An application is **APPROVED** if ALL conditions are met:

1. **Credit Score** ≥ 550 (minimum threshold)
2. **Disposable Income** > R2,000
3. **Max Loan Amount** ≥ R500

### Decline Reasons

```typescript
if (creditScore < 550) {
  reason = "Credit score below minimum threshold"
}

if (disposableIncome <= 2000) {
  reason = "Insufficient disposable income"
}

if (maxLoanAmount < 500) {
  reason = "Affordability assessment failed"
}
```

### Affordability Formula

```typescript
// Disposable Income
disposableIncome = monthlyIncome - existingMonthlyObligations

// Affordability Threshold (35% Rule)
affordabilityThreshold = monthlyIncome * 0.35

// Max Loan Amount
maxLoanAmount = min(4000, affordabilityThreshold * 3)
```

## Error Handling

### Graceful Fallback

If Experian API fails:
```
⚠️ Experian API error, falling back to mock
```

The system uses mock data instead of failing. This ensures:
- ✅ Users can still apply for loans
- ✅ No service interruption
- ✅ Admin is notified via console logs

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid credentials | Verify environment variables |
| 403 Forbidden | API key expired | Contact Experian support |
| 429 Too Many Requests | Rate limit exceeded | Implement backoff strategy |
| 500 Server Error | Experian service down | Use fallback mock data |

## Response Data Mapping

### Experian Response → CreditReport

| Experian Field | CreditReport Field | Notes |
|---|---|---|
| `creditScore` | `creditScore` | 300-850 scale |
| `totalMonthlyObligations` | `existingObligations` | Used for affordability calc |
| `score` risk category | `creditRisk` | excellent/good/fair/poor |
| `numberOfAccounts` | `numberOfAccounts` | Total credit accounts |
| `defaultedAccounts` | `defaultedAccounts` | Defaulted accounts count |
| `judgments` | `judgments` | Legal judgments against applicant |
| `administrationOrders` | `administrationOrders` | Administration orders |

## Testing

### Test with Mock Data

1. **Remove** Experian environment variables
2. Mock data will be used automatically
3. Credit scores will be random 400-800

### Test with Real Experian

1. **Add** valid Experian credentials to environment
2. Check console logs for `✅ Real Experian credit check completed`
3. Test with various applicants

### Test Cases

```typescript
// Case 1: High score, high income (should approve)
{
  idNumber: "8001015009087",
  firstName: "John",
  lastName: "Doe",
  dateOfBirth: "1980-01-01",
  income: 10000,
  existingDebts: 0
}

// Case 2: Low score (should decline)
{
  idNumber: "9001015009087",
  firstName: "Jane",
  lastName: "Smith",
  dateOfBirth: "1990-01-15",
  income: 5000,
  existingDebts: 2000  // Score < 550
}

// Case 3: Insufficient income (should decline)
{
  idNumber: "7001015009087",
  firstName: "Bob",
  lastName: "Johnson",
  dateOfBirth: "1970-06-20",
  income: 1500,
  existingDebts: 0  // Disposable < R2000
}
```

## Production Checklist

- [ ] Add Experian credentials to Supabase secrets
- [ ] Test credit check with real Experian API
- [ ] Verify error handling and fallback behavior
- [ ] Test with various applicant profiles
- [ ] Update CreditCheckStep component to display additional fields
- [ ] Document decline reasons for support team
- [ ] Set up monitoring for Experian API failures
- [ ] Configure rate limiting if needed
- [ ] Test with production Experian account
- [ ] Update privacy policy for Experian data usage

## Monitoring & Logging

### Console Logs

The system logs:
```
✅ Real Experian credit check completed for {idNumber}
⚠️ Experian API error, falling back to mock: {error}
ℹ️ Experian credentials not configured, using mock credit check
```

### Log Levels

- **INFO** - Normal operation (mock used)
- **WARN** - Fallback to mock due to error
- **ERROR** - Critical failures

## Security Considerations

### Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all secrets
3. **Implement rate limiting** to prevent abuse
4. **Validate user consent** before credit check
5. **Encrypt stored credit data** if persisting
6. **Audit log all credit checks** for compliance
7. **Implement IP whitelisting** if available

### Data Privacy

- Experian data should not be logged
- Credit checks require user consent
- Store only approved/declined decision, not raw score
- Comply with POPIA (Protection of Personal Information Act)

## Troubleshooting

### Issue: "Missing Experian credentials"

**Solution**: Ensure all 4 environment variables are set:
```bash
supabase secrets set EXPERIAN_CLIENT_ID="..."
supabase secrets set EXPERIAN_CLIENT_SECRET="..."
supabase secrets set EXPERIAN_USERNAME="..."
supabase secrets set EXPERIAN_PASSWORD="..."
```

### Issue: "Failed to obtain access token"

**Causes**:
- Invalid credentials
- Incorrect endpoint URL
- API key has expired

**Solution**: 
- Verify credentials with Experian
- Check API endpoint in `experianService.ts`
- Contact Experian support for token issues

### Issue: Credit check always returns mock data

**Check**:
1. Are environment variables set?
2. Run: `supabase secrets list` to verify
3. Check console logs for errors

### Issue: Rate limit errors (429)

**Solution**:
- Implement exponential backoff
- Cache results when possible
- Contact Experian about rate limits

## Future Enhancements

1. **Caching** - Cache credit scores for 24 hours
2. **Monitoring** - Track API success/failure rates
3. **Analytics** - Measure approval/decline rates
4. **Webhooks** - Real-time updates from Experian
5. **Multiple Bureaus** - Add other credit bureaus
6. **Machine Learning** - Custom scoring models

## Support

For issues:
1. Check console logs for error messages
2. Verify environment variables
3. Contact Experian support for API issues
4. Review this guide's troubleshooting section

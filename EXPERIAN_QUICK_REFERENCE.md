# Experian Integration - Quick Reference

## 🚀 Get Started in 5 Minutes

### Step 1: Get Credentials (Contact Experian)
```
Contact: Experian South Africa
Website: https://www.experian.co.za/
Request: API access for credit risk assessment & identity verification
You'll receive:
- Client ID
- Client Secret
- Username
- Password
```

### Step 2: Add to Supabase (Choose One Method)

**Option A: Using CLI (Recommended)**
```bash
supabase secrets set EXPERIAN_CLIENT_ID="your_client_id"
supabase secrets set EXPERIAN_CLIENT_SECRET="your_client_secret"
supabase secrets set EXPERIAN_USERNAME="your_username"
supabase secrets set EXPERIAN_PASSWORD="your_password"
```

**Option B: Using Dashboard**
1. Supabase Dashboard → Settings → Edge Functions
2. Scroll to "Environment Variables"
3. Add all 4 variables
4. Save

**Option C: Local Development**
Create `.env.local`:
```env
EXPERIAN_CLIENT_ID=your_client_id
EXPERIAN_CLIENT_SECRET=your_client_secret
EXPERIAN_USERNAME=your_username
EXPERIAN_PASSWORD=your_password
```

### Step 3: Deploy
```bash
supabase functions deploy
```

### Step 4: Test
Make a credit check request - it should now use real Experian data!

---

## 📋 What Changed

### New Files
- `experianService.ts` - Experian API client
- `EXPERIAN_INTEGRATION.md` - Full guide
- `ENVIRONMENT_SETUP.md` - Setup instructions

### Updated Files
- `loanService.ts` - New CreditReport fields
- `index.tsx` (backend) - Uses real Experian
- `CreditCheckStep.tsx` - Shows more details

---

## 🔍 How It Works

```
User clicks "Check Credit"
         ↓
Backend checks: Do we have Experian credentials?
         ↓
    YES: Call Experian API → Get real credit data
    NO:  Generate mock data
         ↓
Return results to user
```

**Key Point**: If credentials missing or API fails, system automatically uses mock data!

---

## 📊 Credit Check Response

```json
{
  "creditReport": {
    "creditScore": 720,              // 300-850
    "creditRisk": "good",            // excellent/good/fair/poor
    "disposableIncome": 7000,        // Monthly after debts
    "maxLoanAmount": 4000,           // Max they can borrow
    "existingObligations": 1000,     // Current monthly debts
    "approved": true,                // Pass/fail
    "reason": "Meets affordability", // Why approved/declined
    "source": "experian",            // Where data came from
    "numberOfAccounts": 3,           // Credit accounts
    "defaultedAccounts": 0,          // Bad accounts
    "judgments": 0,                  // Legal judgments
    "administrationOrders": 0        // Admin orders
  }
}
```

---

## ✅ Approval Criteria

An application is **APPROVED** if:
1. ✅ Credit score ≥ 550
2. ✅ Disposable income > R2,000
3. ✅ Max loan amount ≥ R500

---

## 🔧 Environment Variables

| Variable | Description |
|---|---|
| `EXPERIAN_CLIENT_ID` | OAuth2 client ID |
| `EXPERIAN_CLIENT_SECRET` | OAuth2 client secret |
| `EXPERIAN_USERNAME` | Service account username |
| `EXPERIAN_PASSWORD` | Service account password |

**All 4 are required to use real Experian. Without them, mock is used.**

---

## 🧪 Testing

### Test with Real Experian
```
1. Add all 4 environment variables
2. Make a credit check request
3. Look for: "✅ Real Experian credit check completed"
```

### Test with Mock Data
```
1. Don't add environment variables
2. Make a credit check request
3. Look for: "ℹ️ Experian credentials not configured"
```

### Verify Setup
```bash
supabase secrets list
# Should show all 4 Experian variables
```

---

## 📱 API Usage

### Frontend (React)
```typescript
const creditReport = await loanService.performCreditCheck(
  idNumber,        // "8001015009087"
  income,          // 8000
  existingDebts,   // 1000
  accessToken,     // JWT token
  firstName,       // "John"
  lastName,        // "Doe"
  dateOfBirth      // "1980-01-01"
);
```

### Backend Request
```
POST /make-server-1ed353c1/credit-check
Authorization: Bearer {accessToken}

{
  "idNumber": "8001015009087",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-01-01",
  "income": 8000,
  "existingDebts": 1000
}
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| "Still using mock data" | Ensure ALL 4 env vars are set: `supabase secrets list` |
| "Connection timeout" | Check Experian API endpoint in `experianService.ts` |
| "Invalid credentials" | Verify credentials from Experian email |
| "Token error" | Check username/password are correct |
| "Credit check slow" | Normal - Experian takes 2-3 seconds |

---

## 📚 Documentation

- **Full Guide**: `EXPERIAN_INTEGRATION.md`
- **Setup Help**: `ENVIRONMENT_SETUP.md`
- **This File**: Quick reference

---

## 🔐 Security Checklist

- ✅ Never commit credentials to git
- ✅ Use environment variables only
- ✅ Rotate credentials regularly
- ✅ Add `.env.local` to `.gitignore`
- ✅ Review access logs periodically

---

## 🎯 Common Decline Reasons

| Reason | Meaning |
|---|---|
| "Credit score below minimum threshold" | Score < 550 (too risky) |
| "Insufficient disposable income" | After debts, < R2,000 left (can't afford) |
| "Affordability assessment failed" | Income too low for any loan |

---

## 💡 Pro Tips

1. **Local Testing**: Just create `.env.local`, mock data still works
2. **Fallback Safety**: System won't break if Experian is down
3. **Debugging**: Check console logs - they tell you what's happening
4. **Performance**: Token caching means 2nd request is faster
5. **Data Fresh**: Credit checks are real-time with Experian

---

## 📞 Need Help?

1. **Setup Issues**: See `ENVIRONMENT_SETUP.md`
2. **API Issues**: See `EXPERIAN_INTEGRATION.md`
3. **Technical Help**: Check console logs
4. **Experian API**: Contact Experian support
5. **Supabase Help**: Check Supabase docs

---

## ✨ What's Different Now?

### Before (Mock)
- ❌ Random credit scores
- ❌ No real debts data
- ❌ Simple pass/fail

### After (Real Experian)
- ✅ Real credit scores
- ✅ Actual debts from credit report
- ✅ Risk categorization
- ✅ Detailed credit profile
- ✅ Intelligent fallback

---

**Ready to integrate?** Start with Step 1 above! 🚀

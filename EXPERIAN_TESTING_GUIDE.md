# Experian Integration Testing Guide

## Test Environment Setup

### Prerequisites
- Running dev server: `npm run dev`
- Supabase project initialized
- Test user account created

## Test Scenarios

### Scenario 1: Without Experian Credentials (Mock Data)

**Setup**:
- Don't configure any Experian environment variables
- Keep `.env.local` empty (or remove Experian variables)

**Steps**:
1. Start dev server: `npm run dev`
2. Create/login to user account
3. Start loan application
4. Complete steps up to Credit Check
5. Submit credit check form

**Expected Results**:
```
✅ Console shows: "ℹ️ Experian credentials not configured, using mock credit check"
✅ Credit score is random between 400-800
✅ Result shows "source: mock" in response
✅ User can proceed with application
```

**What to Check**:
- [ ] Random credit scores on each request
- [ ] Mock data format is correct
- [ ] No errors in console
- [ ] UI displays properly

---

### Scenario 2: With Valid Experian Credentials

**Setup**:
```bash
supabase secrets set EXPERIAN_CLIENT_ID="your_client_id"
supabase secrets set EXPERIAN_CLIENT_SECRET="your_client_secret"
supabase secrets set EXPERIAN_USERNAME="your_username"
supabase secrets set EXPERIAN_PASSWORD="your_password"
```

Or in `.env.local`:
```env
EXPERIAN_CLIENT_ID=your_client_id
EXPERIAN_CLIENT_SECRET=your_client_secret
EXPERIAN_USERNAME=your_username
EXPERIAN_PASSWORD=your_password
```

**Steps**:
1. Restart dev server
2. Create/login to user account
3. Start loan application
4. Complete steps up to Credit Check
5. Submit with realistic data:
   ```
   ID Number: 8001015009087
   Income: 10000
   Existing Debts: 0
   ```
6. Submit credit check form

**Expected Results**:
```
✅ Console shows: "✅ Real Experian credit check completed for 8001015009087"
✅ Credit score is from Experian (300-850 range)
✅ Result shows "source: experian"
✅ Additional fields shown (accounts, judgments, etc.)
✅ Response time ~2-3 seconds (normal)
```

**What to Check**:
- [ ] Real credit score received
- [ ] Disposable income calculated correctly
- [ ] Credit risk category shown (excellent/good/fair/poor)
- [ ] Additional credit profile data displayed
- [ ] No errors in console

---

### Scenario 3: Invalid Credentials (Fallback to Mock)

**Setup**:
```env
EXPERIAN_CLIENT_ID=invalid_id
EXPERIAN_CLIENT_SECRET=invalid_secret
EXPERIAN_USERNAME=invalid_user
EXPERIAN_PASSWORD=invalid_pass
```

**Steps**:
1. Restart dev server
2. Attempt credit check
3. Observe response

**Expected Results**:
```
✅ Console shows: "⚠️ Experian API error, falling back to mock: ..."
✅ Credit check still completes successfully
✅ Result shows "source: mock" (fallback)
✅ User experience unaffected
```

**What to Check**:
- [ ] System doesn't crash
- [ ] Falls back to mock gracefully
- [ ] Warning logged but no error to user
- [ ] Application continues normally

---

### Scenario 4: High Income Applicant (Should Approve)

**Test Data**:
```json
{
  "idNumber": "8001015009087",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-01-01",
  "income": 10000,
  "existingDebts": 0
}
```

**Expected**:
- ✅ Credit score should be high (if real Experian)
- ✅ Disposable income: 10000
- ✅ Affordability threshold: 3500
- ✅ Max loan: min(4000, 10500) = 4000
- ✅ **APPROVED** ✅

**Verify**:
- [ ] Approved message displayed
- [ ] Max loan amount shown correctly
- [ ] Can proceed to loan agreement
- [ ] All calculations correct

---

### Scenario 5: Low Income Applicant (Should Decline)

**Test Data**:
```json
{
  "idNumber": "9001015009087",
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1990-01-15",
  "income": 1500,
  "existingDebts": 0
}
```

**Expected**:
- ✅ Disposable income: 1500
- ✅ Below minimum of 2000
- ✅ **DECLINED** with reason: "Insufficient disposable income"

**Verify**:
- [ ] Declined message displayed
- [ ] Correct decline reason shown
- [ ] Cannot proceed to loan agreement
- [ ] Helpful message about reapplying

---

### Scenario 6: High Debt Applicant (Should Decline)

**Test Data**:
```json
{
  "idNumber": "7001015009087",
  "firstName": "Bob",
  "lastName": "Johnson",
  "dateOfBirth": "1970-06-20",
  "income": 6000,
  "existingDebts": 5000
}
```

**Expected**:
- ✅ Disposable income: 1000
- ✅ Below minimum of 2000
- ✅ **DECLINED** with reason: "Insufficient disposable income"

**Verify**:
- [ ] Declined due to high existing debts
- [ ] Disposable income calculation correct
- [ ] Appropriate decline message

---

### Scenario 7: Marginal Case (May Approve)

**Test Data**:
```json
{
  "idNumber": "6001015009087",
  "firstName": "Alice",
  "lastName": "Williams",
  "dateOfBirth": "1960-03-10",
  "income": 5000,
  "existingDebts": 0
}
```

**Expected** (with real Experian):
- ✅ Disposable income: 5000
- ✅ Affordability threshold: 1750
- ✅ Max loan: min(4000, 5250) = 4000
- ✅ Approval depends on credit score
- ✅ Result: Likely **APPROVED** or **DECLINED** based on credit

**Verify**:
- [ ] Result aligns with credit score
- [ ] Calculation is accurate
- [ ] Message makes sense

---

## Manual Testing Checklist

### Before Each Test
- [ ] Dev server running
- [ ] Database is clean
- [ ] No cached data interfering
- [ ] Browser dev tools open (watch console)

### During Test
- [ ] Watch console for log messages
- [ ] Check network tab for API calls
- [ ] Verify response payload
- [ ] Note response time
- [ ] Check for any errors or warnings

### After Test
- [ ] Record test results
- [ ] Note any issues
- [ ] Screenshot if needed
- [ ] Clean up test data

---

## Automated Testing (Optional)

### API Test Example

```bash
# Get auth token
TOKEN="your_jwt_token"

# Make credit check request
curl -X POST http://localhost:3000/make-server-1ed353c1/credit-check \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idNumber": "8001015009087",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1980-01-01",
    "income": 8000,
    "existingDebts": 1000
  }'
```

**Expected Response**:
```json
{
  "creditReport": {
    "id": "uuid",
    "creditScore": 720,
    "creditRisk": "good",
    "disposableIncome": 7000,
    "maxLoanAmount": 4000,
    "approved": true,
    "reason": "Meets affordability requirements",
    "source": "experian"
  }
}
```

---

## Performance Testing

### Measure Response Time

```bash
# Test mock (should be instant)
time curl http://localhost:3000/credit-check

# Result: ~0.1 seconds

# Test real Experian (should be ~2-3 seconds)
time curl http://localhost:3000/credit-check

# Result: ~2-3 seconds (normal)
```

**Performance Goals**:
- Mock check: < 100ms
- Experian check: < 5 seconds
- Fallback: instant

---

## Error Handling Tests

### Network Error Simulation

**Steps**:
1. Disconnect internet
2. Attempt credit check
3. Observe system behavior

**Expected**:
- ✅ Graceful fallback to mock
- ✅ Warning logged
- ✅ User can still apply

### Invalid Data Tests

**Invalid Income** (not a number):
```json
{
  "income": "not_a_number",
  "existingDebts": 1000
}
```
Expected: Error response with message

**Missing Required Fields**:
```json
{
  "existingDebts": 1000
}
```
Expected: Error about missing idNumber/income

**Negative Values**:
```json
{
  "income": -1000,
  "existingDebts": -500
}
```
Expected: Either validation error or correct calculation with negatives

---

## UI/UX Testing

### Check CreditCheckStep Component

- [ ] Approval message displays with green styling
- [ ] Declined message displays with red styling
- [ ] Credit score shown with appropriate color
- [ ] Credit risk badge displays (when from real Experian)
- [ ] Disposable income formatted correctly
- [ ] Max loan amount shown only on approval
- [ ] Reason text is clear and helpful
- [ ] Additional credit profile shows (only real Experian)
- [ ] Alert messages are appropriate
- [ ] Next button logic works
- [ ] Mobile responsive

---

## Regression Testing Checklist

After implementing changes, verify:

- [ ] Loan application still works end-to-end
- [ ] Mock data still works without credentials
- [ ] Real Experian works with credentials
- [ ] Error handling works for all scenarios
- [ ] Credit scores within valid range
- [ ] Disposable income calculates correctly
- [ ] Approval logic is correct
- [ ] Decline reasons are accurate
- [ ] UI displays all fields correctly
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Response format consistent

---

## Test Data Suite

Use these ID numbers for consistent testing:

```
High Income:        8001015009087
Low Income:         9001015009087
Marginal Income:    7001015009087
High Debt:          6001015009087
Test Case 5:        5001015009087
Test Case 6:        4001015009087
```

---

## Known Issues & Workarounds

### Issue: Token Expires During Test
**Workaround**: Refresh auth token and retry

### Issue: Credit Check Takes Too Long
**Expected**: Real Experian takes 2-3 seconds
**Not a bug**: This is normal

### Issue: Mock Score Too High/Low
**Expected**: Random 400-800
**Not a bug**: This is by design

---

## Reporting Issues

When reporting a bug, include:
1. Test scenario/steps to reproduce
2. Expected vs actual result
3. Console error messages
4. Browser/environment info
5. Request/response payload
6. Screenshot if applicable

---

## Sign-Off Template

```
Test Date: _______________
Tester: _______________
Environment: _______________

Scenario 1 (Mock): ✅ / ❌
Scenario 2 (Real): ✅ / ❌
Scenario 3 (Fallback): ✅ / ❌
Scenario 4 (High Income): ✅ / ❌
Scenario 5 (Low Income): ✅ / ❌
Scenario 6 (High Debt): ✅ / ❌
Scenario 7 (Marginal): ✅ / ❌

Issues Found:
1. _________________
2. _________________
3. _________________

Overall Status: ✅ READY / ⏸️ NEEDS WORK / ❌ BLOCKED

Comments:
_______________________
```

---

**Ready to test?** Start with Scenario 1 (Mock Data) first! 🧪

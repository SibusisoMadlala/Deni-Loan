# Experian Integration - Implementation Checklist

Use this checklist to track your progress through the integration process.

## 📋 Phase 1: Understanding (30 minutes)

- [ ] Read `START_HERE_EXPERIAN.md`
- [ ] Review `EXPERIAN_QUICK_REFERENCE.md`
- [ ] Look at `EXPERIAN_VISUAL_GUIDE.md` for architecture
- [ ] Understand the approval logic

**Completion Criteria**: You understand what Experian integration does and how it works

---

## 📋 Phase 2: Setup & Configuration (varies based on Experian response)

### Step 1: Get Experian Credentials
- [ ] Contact Experian South Africa
  - [ ] Visit https://www.experian.co.za/
  - [ ] Request API access for credit risk assessment
  - [ ] Provide company details
  - [ ] Provide use case (loan application)
- [ ] Receive confirmation
- [ ] Receive credentials:
  - [ ] Client ID
  - [ ] Client Secret
  - [ ] Username
  - [ ] Password

**Timeline**: 1-5 business days

### Step 2: Local Development Setup
- [ ] Create `.env.local` in project root
- [ ] Add 4 Experian environment variables:
  ```env
  EXPERIAN_CLIENT_ID=your_value
  EXPERIAN_CLIENT_SECRET=your_value
  EXPERIAN_USERNAME=your_value
  EXPERIAN_PASSWORD=your_value
  ```
- [ ] Save file (don't commit to git!)
- [ ] Add `.env.local` to `.gitignore` (should already be there)
- [ ] Restart dev server: `npm run dev`

**Verification**: 
```bash
npm run dev
# Check console for: ✅ Real Experian credit check completed
```

### Step 3: Production Setup (Supabase)
- [ ] Review `ENVIRONMENT_SETUP.md` setup section
- [ ] Log into Supabase Dashboard
- [ ] Go to Settings → Edge Functions
- [ ] Add Environment Variables:
  - [ ] `EXPERIAN_CLIENT_ID`
  - [ ] `EXPERIAN_CLIENT_SECRET`
  - [ ] `EXPERIAN_USERNAME`
  - [ ] `EXPERIAN_PASSWORD`
- [ ] Click Save

**OR** using CLI:
```bash
- [ ] supabase secrets set EXPERIAN_CLIENT_ID="..."
- [ ] supabase secrets set EXPERIAN_CLIENT_SECRET="..."
- [ ] supabase secrets set EXPERIAN_USERNAME="..."
- [ ] supabase secrets set EXPERIAN_PASSWORD="..."
- [ ] Verify: supabase secrets list
```

**Verification**: All 4 variables show in `supabase secrets list`

---

## 📋 Phase 3: Testing (1-2 hours)

### Test 1: Mock Data (No Credentials)
- [ ] Remove/comment out all Experian variables from `.env.local`
- [ ] Restart dev server
- [ ] Make a credit check request
- [ ] Verify: Console shows "ℹ️ Experian credentials not configured"
- [ ] Verify: Credit score is random 400-800
- [ ] Verify: Result shows `source: "mock"`
- [ ] Document: ✅ PASSED

### Test 2: Real Experian (With Credentials)
- [ ] Ensure all 4 variables are in `.env.local`
- [ ] Restart dev server
- [ ] Make a credit check request with:
  - ID: 8001015009087
  - Income: 10000
  - Existing Debts: 0
- [ ] Verify: Console shows "✅ Real Experian credit check completed"
- [ ] Verify: Credit score from Experian (not random)
- [ ] Verify: Result shows `source: "experian"`
- [ ] Verify: Credit risk badge shows (good/fair/poor/excellent)
- [ ] Verify: Additional credit profile data shown
- [ ] Verify: Response time ~2-3 seconds
- [ ] Document: ✅ PASSED

### Test 3: Error Handling (Fallback)
- [ ] Disconnect internet (or use invalid credentials)
- [ ] Make a credit check request
- [ ] Verify: System doesn't crash
- [ ] Verify: Falls back to mock data gracefully
- [ ] Verify: Console shows warning: "⚠️ Experian API error"
- [ ] Verify: User experience unaffected
- [ ] Document: ✅ PASSED

### Test 4: High Income Approval
- [ ] Submit with: Income R10,000, No Debt
- [ ] Verify: Shows APPROVED
- [ ] Verify: Max amount shown (should be R4,000)
- [ ] Verify: Can proceed to next step
- [ ] Document: ✅ PASSED

### Test 5: Low Income Decline
- [ ] Submit with: Income R1,500, No Debt
- [ ] Verify: Shows DECLINED
- [ ] Verify: Reason: "Insufficient disposable income"
- [ ] Verify: Cannot proceed to next step
- [ ] Document: ✅ PASSED

### Test 6: High Debt Decline
- [ ] Submit with: Income R6,000, Existing Debt R5,000
- [ ] Verify: Shows DECLINED
- [ ] Verify: Reason: "Insufficient disposable income"
- [ ] Document: ✅ PASSED

### Test 7: UI Display
- [ ] Verify: Approval message shows with green styling
- [ ] Verify: Decline message shows with red styling
- [ ] Verify: Credit score displays with color coding
- [ ] Verify: Disposable income formatted as currency
- [ ] Verify: Max loan amount shown only on approval
- [ ] Verify: Credit profile details shown (if real Experian)
- [ ] Verify: Data source badge shows ("Real" vs "Mock")
- [ ] Verify: Mobile responsive
- [ ] Document: ✅ PASSED

**Overall Testing Status**: 
- [ ] All 7 tests PASSED ✅
- [ ] No errors in console
- [ ] Performance acceptable
- [ ] UI looks good

---

## 📋 Phase 4: Code Review (30 minutes)

- [ ] Review `experianService.ts`
  - [ ] Understand OAuth2 token management
  - [ ] Understand credit check logic
  - [ ] Check error handling

- [ ] Review updated backend (`index.tsx`)
  - [ ] Understand credential detection
  - [ ] Understand fallback logic
  - [ ] Check response format

- [ ] Review updated `CreditCheckStep.tsx`
  - [ ] Understand new UI elements
  - [ ] Verify data binding
  - [ ] Check responsive design

- [ ] Review updated `loanService.ts`
  - [ ] Understand new interface fields
  - [ ] Verify method signatures

---

## 📋 Phase 5: Documentation Review (20 minutes)

- [ ] Review `EXPERIAN_INTEGRATION.md`
  - [ ] Understand API endpoints
  - [ ] Understand response format
  - [ ] Check error codes

- [ ] Review `ENVIRONMENT_SETUP.md`
  - [ ] Understand all setup methods
  - [ ] Note troubleshooting tips

- [ ] Review `EXPERIAN_TESTING_GUIDE.md`
  - [ ] Understand test scenarios
  - [ ] Know how to verify setup

- [ ] Review `EXPERIAN_VISUAL_GUIDE.md`
  - [ ] Understand architecture
  - [ ] Understand data flows

---

## 📋 Phase 6: Security Review (20 minutes)

- [ ] Verify no credentials in source code
- [ ] Verify `.env.local` in `.gitignore`
- [ ] Verify no credentials logged to console
- [ ] Verify OAuth2 token handling correct
- [ ] Verify error messages don't expose secrets
- [ ] Review rate limiting strategy (if applicable)
- [ ] Document security measures taken

**Security Sign-Off**: ✅ APPROVED

---

## 📋 Phase 7: Deployment (30 minutes)

### Pre-Deployment Checklist
- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Documentation complete
- [ ] Team aware of changes
- [ ] Experian credentials verified working

### Deployment Steps
- [ ] Deploy backend function: `supabase functions deploy`
- [ ] Verify deployment successful
- [ ] Check Edge Function logs for errors
- [ ] Verify credentials in production
- [ ] Test one credit check in production

### Post-Deployment Verification
- [ ] Test credit check in production
- [ ] Verify: Shows "✅ Real Experian credit check completed"
- [ ] Verify: Response time acceptable (~3 seconds)
- [ ] Verify: No errors in Supabase logs
- [ ] Verify: UI displays correctly
- [ ] Document: ✅ DEPLOYMENT SUCCESSFUL

---

## 📋 Phase 8: Monitoring (Ongoing)

### Day 1 (Launch Day)
- [ ] Monitor Supabase Edge Function logs
- [ ] Check for any errors or warnings
- [ ] Track credit check response times
- [ ] Monitor for unusual patterns
- [ ] Keep team on standby for issues

### Week 1
- [ ] Review all credit check requests
- [ ] Check approval/decline rates
- [ ] Monitor for API errors
- [ ] Verify no performance degradation
- [ ] Check error logs daily

### Week 2+
- [ ] Continue daily monitoring
- [ ] Weekly review of metrics
- [ ] Document any issues
- [ ] Plan any optimizations
- [ ] Collect user feedback

### Ongoing Monitoring Tasks
- [ ] Set up alerts for high error rates
- [ ] Monitor Experian API rate limits
- [ ] Track token refresh frequency
- [ ] Monitor response time trends
- [ ] Review failed requests

---

## 📋 Phase 9: Team Communication

- [ ] Document integration for team
- [ ] Train support team on new fields
- [ ] Explain approval/decline logic
- [ ] Show how to check integration status
- [ ] Provide troubleshooting guide

**Documents to Share**:
- [ ] `START_HERE_EXPERIAN.md`
- [ ] `EXPERIAN_QUICK_REFERENCE.md`
- [ ] `ENVIRONMENT_SETUP.md` (setup section)

---

## 📋 Phase 10: Optimization (Optional)

- [ ] Implement token caching strategy
- [ ] Add monitoring/alerting
- [ ] Optimize response times
- [ ] Add analytics tracking
- [ ] Consider fallback improvements

---

## 📋 Sign-Off & Documentation

### Final Checklist
- [ ] All phases completed
- [ ] All tests passed
- [ ] Code reviewed
- [ ] Deployed to production
- [ ] Monitoring in place
- [ ] Team trained
- [ ] Documentation complete

### Sign-Off (To be completed)
```
Integration Started:     _______________
Integration Completed:   _______________
Deployed to Production:  _______________

Implemented By:          _______________
Reviewed By:             _______________
Approved By:             _______________

Date: _______________

Issues Encountered: 
_________________________________________________

Lessons Learned:
_________________________________________________

Next Steps:
_________________________________________________
```

---

## 📊 Progress Tracking

Use this to track overall progress:

```
Phase 1: Understanding          [████████░░] 80%
Phase 2: Setup & Configuration  [████░░░░░░] 40%
Phase 3: Testing                [██░░░░░░░░] 20%
Phase 4: Code Review            [░░░░░░░░░░] 0%
Phase 5: Documentation Review   [░░░░░░░░░░] 0%
Phase 6: Security Review        [░░░░░░░░░░] 0%
Phase 7: Deployment             [░░░░░░░░░░] 0%
Phase 8: Monitoring             [░░░░░░░░░░] 0%
Phase 9: Team Communication     [░░░░░░░░░░] 0%
Phase 10: Optimization          [░░░░░░░░░░] 0%

Overall: [████░░░░░░░░░░░░░░░░░░░░░░░░░░] 13%
```

---

## 🆘 Troubleshooting During Checklist

| Issue | Solution | Document |
|-------|----------|----------|
| Can't get credentials | Contact Experian | Directly |
| Environment vars not working | Check .env.local path | ENVIRONMENT_SETUP.md |
| Tests failing | Check credentials | EXPERIAN_TESTING_GUIDE.md |
| Deployment fails | Check secrets set | ENVIRONMENT_SETUP.md |
| Real API not being called | Verify credentials | EXPERIAN_QUICK_REFERENCE.md |

---

## ✅ Completion Status

When you've completed the entire checklist:

- ✅ All phases completed
- ✅ All tests passed
- ✅ Deployed to production
- ✅ Monitoring active
- ✅ Team trained
- ✅ Ready for business!

**Estimated Total Time**: 8-16 hours (depending on Experian response time)

---

**Start with Phase 1 and work through systematically!** 📋

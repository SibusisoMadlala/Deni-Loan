# Experian Integration - Visual Architecture & Flows

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Browser)                   │
│                                                                 │
│  ┌──────────────────┐                                           │
│  │ Loan Application │                                           │
│  │  Multi-Step Form │                                           │
│  └────────┬─────────┘                                           │
│           │                                                      │
│  ┌────────▼───────────────────────────────┐                    │
│  │  CreditCheckStep Component             │                    │
│  │  - Shows credit score                  │                    │
│  │  - Shows disposable income             │                    │
│  │  - Shows credit risk badge             │                    │
│  │  - Shows approval/decline result       │                    │
│  │  - Shows credit profile (if real)      │                    │
│  └────────┬───────────────────────────────┘                    │
│           │                                                      │
│  ┌────────▼───────────────────────────────┐                    │
│  │    loanService.performCreditCheck()    │                    │
│  │  - Calls backend /credit-check         │                    │
│  └────────┬───────────────────────────────┘                    │
│           │                                                      │
│           │ HTTP POST with JWT Token                            │
│           │                                                      │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ HTTPS Network Request
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                  BACKEND (Hono Edge Function)                   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  POST /make-server-1ed353c1/credit-check              │   │
│  │  - Authenticate user (JWT)                            │   │
│  │  - Validate request parameters                        │   │
│  │  - Check environment variables                        │   │
│  └────────────────────┬─────────────────────────────────┘   │
│                       │                                       │
│          ┌────────────▼────────────┐                         │
│          │ Has Experian Creds?     │                         │
│          └───────┬────────┬────────┘                         │
│                  │        │                                  │
│           YES    │        │    NO                            │
│                  ▼        ▼                                  │
│          ┌─────────────┐ ┌──────────────────────┐           │
│          │  Experian   │ │  Generate Mock Data  │           │
│          │  Service    │ │  - Random score      │           │
│          │  Call       │ │    (400-800)         │           │
│          └──────┬──────┘ │  - Calculate         │           │
│                 │        │    affordability     │           │
│        ┌────────▼────┐   └──────────────────────┘           │
│        │ OAuth2 Token│                                       │
│        │ (Auto Refresh)                                      │
│        └────────┬────┘                                       │
│                 │                                            │
│        ┌────────▼────────────────────┐                      │
│        │ Experian API Call           │                      │
│        │ - Credit Check Endpoint     │                      │
│        │ - Real Credit Score         │                      │
│        │ - Obligations Data          │                      │
│        │ - Account Details           │                      │
│        └────────┬────────────────────┘                      │
│                 │                                            │
│        ┌────────▼────────────────────┐                      │
│        │ Error Handling              │                      │
│        │ - Network error?            │                      │
│        │ - API error?                │                      │
│        │ - Invalid credentials?      │                      │
│        └────────┬────────────────────┘                      │
│                 │                                            │
│        ┌────────▼────────────────────┐                      │
│        │ Fallback to Mock if Error   │                      │
│        │ (Graceful degradation)      │                      │
│        └────────┬────────────────────┘                      │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │  Calculate Final Results                            │   │
│  │  - Disposable Income                                │   │
│  │  - Affordability Assessment                         │   │
│  │  - Max Loan Amount                                  │   │
│  │  - Approval Decision                                │   │
│  │  - Decline Reason                                   │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐   │
│  │  Return Response                                    │   │
│  │  {                                                  │   │
│  │    creditScore: 720,                                │   │
│  │    creditRisk: "good",                              │   │
│  │    disposableIncome: 7000,                          │   │
│  │    maxLoanAmount: 4000,                             │   │
│  │    approved: true,                                  │   │
│  │    reason: "...",                                   │   │
│  │    source: "experian"                               │   │
│  │  }                                                  │   │
│  └──────────────┬───────────────────────────────────────┘   │
│                 │                                            │
└─────────────────┼────────────────────────────────────────────┘
                  │
                  │ JSON Response
                  │
┌─────────────────▼────────────────────────────────────────────┐
│              FRONTEND (Continued)                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ CreditCheckStep Displays Results                    │  │
│  │ - Show approval or decline message                  │  │
│  │ - Display credit score with risk badge             │  │
│  │ - Show disposable income                           │  │
│  │ - Show max loan amount (if approved)               │  │
│  │ - Show reason for decision                         │  │
│  │ - If real Experian:                                │  │
│  │   - Show credit profile details                    │  │
│  │   - Show data source badge                         │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                           │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │ User Decision                                       │  │
│  │ - Click "Next" (if approved)                        │  │
│  │ - See "Reapply Later" message (if declined)         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence Diagram

```
User              Frontend            Backend           Experian
 │                  │                   │                  │
 │ Click "Check     │                   │                  │
 │ Credit"          │                   │                  │
 │──────────────►   │                   │                  │
 │                  │ POST /credit-check                   │
 │                  │ + JWT Token       │                  │
 │                  │ + Personal Info   │                  │
 │                  ├──────────────────►                   │
 │                  │                   │                  │
 │                  │                   │ Check creds?     │
 │                  │                   │◄──────────┐      │
 │                  │                   │           │      │
 │                  │         [Has Credentials]     │      │
 │                  │                   │           │      │
 │                  │                   │ GET Token │      │
 │                  │                   ├─────────────────►│
 │                  │                   │                  │
 │                  │                   │◄─ Bearer Token ─┤
 │                  │                   │                  │
 │                  │                   │ POST Credit Check│
 │                  │                   ├─────────────────►│
 │                  │                   │                  │
 │                  │                   │ Real Data        │
 │                  │                   │◄─────────────────┤
 │                  │                   │ (Score, Debt, etc)
 │                  │                   │                  │
 │                  │       [Calculate Results]            │
 │                  │                   │                  │
 │                  │◄─ CreditReport ───┤                  │
 │                  │                   │                  │
 │ Show Results     │                   │                  │
 │◄─────────────────┤                   │                  │
 │                  │                   │                  │
```

## Decision Tree Diagram

```
                  ┌─────────────────────────────────┐
                  │  Credit Check Initiated         │
                  └────────────┬────────────────────┘
                               │
                  ┌────────────▼────────────┐
                  │  Experian Credentials   │
                  │  Available?             │
                  └────┬─────────────────┬──┘
                    YES│               NO│
        ┌──────────────┘       ┌─────────▼───────┐
        │                      │ Use Mock Data   │
        ▼                      │ (Random Score)  │
  ┌──────────────┐             └─────┬───────────┘
  │ Call Experian│                   │
  │ API          │             ┌─────▼──────┐
  └──────┬───────┘             │ Calculate  │
         │                     │ Affordability
    ┌────▼──────┐             └─────┬──────┘
    │ Success?  │                   │
    └─┬──────┬──┘          ┌────────▼───────┐
   YES│    NO│             │ Check Criteria │
      ▼      │             └─┬──────────────┘
   ┌──────────────┐        │
   │ Use Real     │    ┌───▼────────────────┐
   │ Data         │    │ All Passed?        │
   └──┬───────────┘    └──┬───────────────┬─┘
      │              YES  │            NO │
      └─────────────┬─────┘         ┌─────▼────┐
                    │               │ DECLINED  │
           ┌────────▼────────┐      │ + Reason  │
           │ Check Criteria  │      └──────────┘
           └────┬──────────┬─┘
            YES │      NO  │
       ┌────────▼──┐  ┌────▼──┐
       │ APPROVED  │  │DECLINED
       │ + Amount  │  │+ Reason
       └───────────┘  └────────┘
```

## Approval Criteria Logic

```
┌─────────────────────────────────────────────────────┐
│           START: Credit Check Result               │
└────────────────────┬────────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │ Credit Score >= 550?  │
         └───┬─────────────────┬─┘
            NO│              YES│
      ┌───────▼──────┐  ┌──────▼────────┐
      │ DECLINE      │  │ Continue      │
      │ Reason:      │  │ Checking      │
      │ "Score below │  │               │
      │  minimum"    │  └────┬──────────┘
      └──────────────┘       │
                             │
             ┌───────────────▼──────────┐
             │ Disposable Income        │
             │ > R2,000?                │
             └─┬──────────────────────┬─┘
              NO│                  YES│
        ┌──────▼──────┐  ┌──────────▼─────┐
        │ DECLINE     │  │ Continue       │
        │ Reason:     │  │ Checking       │
        │ "Insufficient
        │  disposable" │  └────┬──────────┘
        └──────────────┘       │
                               │
               ┌───────────────▼──────────┐
               │ Max Loan Amount          │
               │ >= R500?                 │
               └─┬──────────────────────┬─┘
                NO│                  YES│
          ┌──────▼──────┐  ┌──────────▼──────┐
          │ DECLINE     │  │ APPROVED!       │
          │ Reason:     │  │ Max Amount:     │
          │ "Affordability
          │  failed"    │  │ R{maxAmount}   │
          └──────────────┘  └─────────────────┘
```

## Environment Configuration Decision Tree

```
                    ┌─────────────────────────────────┐
                    │  Start Development              │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  Have Experian Credentials?     │
                    └────┬───────────────────────────┬─┘
                      YES│                        NO │
             ┌────────────▼───────────┐  ┌─────────▼────────┐
             │ Add to Supabase        │  │ Use Mock Data    │
             │ Environment Variables  │  │ (No setup needed)│
             │                        │  └──────────────────┘
             │ supabase secrets set   │         │
             │ EXPERIAN_CLIENT_ID=... │         │
             │ ... (4 variables)      │         │
             └──────────┬─────────────┘         │
                        │                       │
                    ┌───▼───────────┐          │
                    │ Deploy Function           │
                    │ supabase functions        │
                    │ deploy                   │
                    └───┬───────────┐          │
                        │           │         │
                ┌───────▼──┐    ┌───▼─────────┘
                │ Real     │    │
                │ Experian │    │
                │ Ready    │    │
                └──────────┘    │
                                │
                     ┌──────────▼──────┐
                     │ Test System     │
                     │ Credit Check    │
                     │ Should work!    │
                     └─────────────────┘
```

## Error Handling Flow

```
                    ┌─────────────────────────────────┐
                    │  Credit Check Request           │
                    │  Received                       │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼────────────────┐
                    │  Call Experian Service          │
                    └────────────────┬────────────────┘
                                     │
                    ┌────────────────▼─────────────────────┐
                    │  Error Occurs?                       │
                    │  - Network timeout                   │
                    │  - Invalid credentials              │
                    │  - API error                        │
                    │  - Rate limit exceeded              │
                    └────┬──────────────────────────────┬──┘
                         NO│                        YES │
                    ┌──────▼───────────┐  ┌────────────▼─────────┐
                    │ Return Real Data │  │ Log Warning Message  │
                    │ from Experian    │  │ ⚠️ Falling back...  │
                    └──────────────────┘  └────────────┬─────────┘
                                                       │
                                    ┌──────────────────▼───────┐
                                    │ Generate Mock Data       │
                                    │ as Fallback              │
                                    └──────────────┬───────────┘
                                                   │
                                    ┌──────────────▼──────────┐
                                    │ Return Fallback Data    │
                                    │ (Same format either way)│
                                    └────────────────────────┘
```

## Credit Risk Assessment Visual

```
Credit Score Range            Risk Level        Color    Badge

850 - 750  |████████████████████|  EXCELLENT     🟦 Blue
           |████████████████████|

749 - 650  |████████████████    |  GOOD          🟩 Green
           |████████████████    |

649 - 550  |████████████        |  FAIR          🟨 Yellow
           |████████████        |

549 - 300  |████                |  POOR          🟥 Red
           |████                |
```

## Integration Complexity Timeline

```
Timeline    Activity                    Status

Day 1       Get Experian Credentials    [PENDING]
            └─ Contact Experian
            └─ Fill out application
            └─ Wait for approval
            └─ Receive API keys

Day 2       Setup Environment           [READY]
            └─ Add variables to Supabase
            └─ Verify with CLI
            └─ Deploy function

Day 3       Testing                     [IN PROGRESS]
            └─ Test with real data
            └─ Test with mock data
            └─ Test fallback scenarios
            └─ Verify UI displays

Day 4       Production Deployment       [READY]
            └─ Deploy to production
            └─ Monitor for errors
            └─ Update admin if needed
            └─ Document changes

Ongoing     Monitoring & Maintenance    [READY]
            └─ Watch error logs
            └─ Track API calls
            └─ Monitor response times
            └─ Update as needed
```

## Files at a Glance

```
Project Root
├── src/
│   ├── services/
│   │   ├── loanService.ts               [UPDATED] Enhanced interfaces
│   │   └── experianService.ts           [NEW] Experian API client
│   │
│   ├── supabase/functions/server/
│   │   └── index.tsx                    [UPDATED] Real Experian integration
│   │
│   ├── components/application-steps/
│   │   └── CreditCheckStep.tsx          [UPDATED] Enhanced UI
│   │
│   └── docs/
│       ├── EXPERIAN_INTEGRATION.md      [NEW] Full documentation
│       └── ENVIRONMENT_SETUP.md         [NEW] Setup guide
│
├── EXPERIAN_QUICK_REFERENCE.md          [NEW] Quick start
├── EXPERIAN_TESTING_GUIDE.md            [NEW] Testing procedures
├── EXPERIAN_IMPLEMENTATION_SUMMARY.md   [NEW] What changed
└── README_EXPERIAN.md                   [NEW] This file's content
```

---

**Visual guides help with understanding!** 📊 Refer back to these diagrams when implementing or troubleshooting.

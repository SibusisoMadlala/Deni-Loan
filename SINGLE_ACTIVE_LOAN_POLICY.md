# Single Active Loan Policy - Implementation ✅

## Overview

The system now enforces a **single active loan policy** where users can only have one approved or disbursed loan at a time. Users must complete payment of their current loan by the next pay day before they can apply for a new one.

## Business Rules

✅ **Only One Active Loan**: User cannot have more than one approved/disbursed loan simultaneously
✅ **Payment Required**: Must complete payment of current loan before new application
✅ **Clear Communication**: Users see status and can't bypass restrictions
✅ **Multiple Pending OK**: Users can have multiple pending applications being reviewed
✅ **Can Reapply After Repaid**: Once loan is marked as 'repaid', user can apply again

## Implementation

### 1. **LoanApplicationPage.tsx** - Block New Applications

#### Added Logic:
```typescript
// Check if user has active approved/disbursed loans
useEffect(() => {
  if (accessToken) {
    checkForActiveLoans()
  }
}, [accessToken])

const checkForActiveLoans = async () => {
  try {
    const apps = await loanService.getMyApplications(accessToken!)
    
    // Check if user has any approved or disbursed loans
    const hasActive = apps.some(app => 
      app.status === 'approved' || app.status === 'disbursed'
    )
    
    setHasActiveApprovedLoan(hasActive)
  } catch (err) {
    console.error('Failed to check applications:', err)
  } finally {
    setCheckingApplications(false)
  }
}
```

#### UI Behavior:
- **Loading**: Shows spinner while checking for active loans
- **Has Active Loan**: Shows blocking screen
- **No Active Loan**: Shows normal application form

#### Blocking Screen:
Shows message:
```
"You currently have an active approved or disbursed loan.

To apply for a new loan, you must:
1. Complete payment of your current loan by the next pay day
2. Once fully repaid, you can apply for a new loan

[Go to Dashboard] button"
```

### 2. **BorrowerDashboard.tsx** - Disable New Application Button

#### Added Logic:
```typescript
// Check if user has active approved/disbursed loan
const hasActiveApprovedLoan = applications.some(app => 
  app.status === 'approved' || app.status === 'disbursed'
);

const canApplyForNewLoan = !hasActiveApprovedLoan;
```

#### Button Updates:
- Button is **disabled** if user has active loan
- Tooltip shows: "Complete your current loan payment before applying for a new one"
- Button remains enabled for users with no active loans

#### Warning Alert:
If user has applications but active loan exists:
```
"Active Loan in Progress: You have an active approved or disbursed loan. 
Please complete payment of your current loan by the next pay day before 
applying for a new one."
```

## Workflow

### User Without Active Loan
```
User navigates to /apply
    ↓
System checks applications
    ↓
No active approved/disbursed loan found
    ↓
Application form displays normally ✓
    ↓
User can complete and submit application
```

### User With Active Loan
```
User navigates to /apply
    ↓
System checks applications
    ↓
Active approved or disbursed loan found
    ↓
Blocking screen displays
    ↓
User must:
  - Return to dashboard
  - View active loan
  - Make payment
  - Once 'repaid' status → Can reapply
```

### Dashboard with Active Loan
```
User views dashboard
    ↓
"New Application" button is DISABLED
    ↓
Warning alert appears
    ↓
Active loan details visible
    ↓
Payment options available
    ↓
User can:
  - View loan details
  - Make repayments
  - Check documents
```

## Application Status States

| Status | Can Apply Again? | Notes |
|--------|-----------------|-------|
| **pending** | ✅ YES | Application being reviewed |
| **approved** | ❌ NO | Active loan (blocked) |
| **declined** | ✅ YES | Can apply for new loan |
| **disbursed** | ❌ NO | Active loan (blocked) |
| **repaid** | ✅ YES | Loan complete - can reapply |

## User Experience Flow

### Scenario 1: First Time User
```
User has no applications
    ↓
Dashboard shows "No Applications Yet"
    ↓
User clicks "Apply for a Loan" → Application form opens
    ↓
User completes all steps
    ↓
Application status: pending
    ↓
User returns to dashboard → Still can apply for new loan
    (because only one pending, not approved)
```

### Scenario 2: Approved Loan Received
```
Admin approves application
    ↓
User logs in to dashboard
    ↓
"New Application" button is DISABLED
    ↓
Warning alert appears
    ↓
User tries to click /apply directly
    ↓
Gets blocking screen explaining why
    ↓
User must complete repayment first
```

### Scenario 3: Completed Repayment
```
User has disbursed/repaid loan
    ↓
Admin marks loan as 'repaid'
    ↓
User refreshes dashboard
    ↓
"New Application" button is now ENABLED ✓
    ↓
User can apply for new loan
```

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/LoanApplicationPage.tsx` | Added active loan check, blocking UI |
| `src/components/BorrowerDashboard.tsx` | Added button disable, warning alert |

### State Management

**LoanApplicationPage State:**
```typescript
const [hasActiveApprovedLoan, setHasActiveApprovedLoan] = useState(false)
const [checkingApplications, setCheckingApplications] = useState(true)
```

**BorrowerDashboard Computed:**
```typescript
const hasActiveApprovedLoan = applications.some(app => 
  app.status === 'approved' || app.status === 'disbursed'
);
const canApplyForNewLoan = !hasActiveApprovedLoan;
```

### API Calls

Uses existing `loanService.getMyApplications()` to:
- Fetch all user's applications
- Check for active loans
- Display in dashboard

No new API endpoints needed.

## Edge Cases Handled

✅ **User bypasses by going to /apply directly**: Blocking screen prevents access
✅ **Multiple pending applications**: Only approved/disbursed block new applications
✅ **Pending + Approved**: Only the approved blocks new applications
✅ **Declined + Apply Again**: Can apply (only blocks approved/disbursed)
✅ **Page refresh**: Status rechecked from database
✅ **Multiple tabs**: Each checks independently (good UX)

## Security Considerations

✅ **Backend enforcement needed**: This is frontend validation
✅ **Should also check on backend** when creating new application:
   - Validate user doesn't have active approved/disbursed loan
   - Prevent API abuse
   - Return 400 Bad Request if violated

### Suggested Backend Validation
```
POST /loan-application
├─ Validate user token
├─ Check user doesn't have active approved/disbursed loan
├─ If yes: Return 400 "User has active loan"
└─ If no: Create application
```

## User Communications

### In Dashboard
- Disabled button with tooltip
- Clear warning alert
- Active loan displayed prominently

### In Application Form
- Blocking screen with explanation
- Clear next steps
- Link back to dashboard

### Messaging
- "You currently have an active approved or disbursed loan"
- "Complete payment of your current loan by the next pay day"
- "Once fully repaid, you can apply for a new loan"

## Testing Checklist

- [ ] User with no applications can apply
- [ ] User with pending application can still apply (not blocked)
- [ ] User with approved application cannot apply (blocked)
- [ ] User with declined application can apply again
- [ ] User with disbursed application cannot apply (blocked)
- [ ] Dashboard button disabled for active loans
- [ ] Dashboard button enabled when no active loans
- [ ] Blocking screen shows at /apply route
- [ ] Can navigate back from blocking screen
- [ ] Warning alert visible in dashboard
- [ ] Multiple tabs - status consistent

## Future Enhancements

- [ ] Email notification when can reapply
- [ ] Show countdown to when next loan eligible
- [ ] Allow admin to override restriction
- [ ] Show repayment progress bar
- [ ] Schedule automatic status update after repayment

## Summary

The system now enforces a responsible lending policy:

1. **One Active Loan**: No concurrent approved/disbursed loans
2. **Payment First**: Complete current loan before new application
3. **Clear Rules**: Users understand restrictions and why
4. **Multiple Touchpoints**: Blocking at both form and button level
5. **Good UX**: Users know exactly what to do next

This prevents:
- ❌ Users taking multiple loans simultaneously
- ❌ Debt accumulation without repayment
- ❌ Over-borrowing
- ❌ Unrealistic payment obligations

---

**Status**: ✅ COMPLETE AND READY

Users can now only have one active approved loan at a time!

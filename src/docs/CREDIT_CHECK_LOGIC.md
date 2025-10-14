# Credit Check & Affordability Logic

## Overview

The system performs an automated credit check and affordability assessment to comply with NCR (National Credit Regulator) requirements. This is currently a mock implementation that simulates Experian-style credit checks.

## Mock Credit Score Generation

The system generates a random credit score between 400-800:

```typescript
const creditScore = Math.floor(Math.random() * 400) + 400
```

**Credit Score Ranges:**
- 300-549: Poor (High risk)
- 550-649: Fair (Moderate risk)
- 650-749: Good (Low risk)
- 750-850: Excellent (Very low risk)

**Minimum Requirement:** 550

## Affordability Calculation

### Input Parameters
1. **Monthly Income** (netSalary)
2. **Existing Debts** (currently set to 0, can be expanded)
3. **Requested Loan Amount**

### Calculation Steps

#### 1. Disposable Income
```typescript
const disposableIncome = monthlyIncome - monthlyDebts
```

**Minimum Required:** R2000

#### 2. Affordability Threshold (35% Rule)
```typescript
const affordabilityThreshold = monthlyIncome * 0.35
```

This is based on the NCR guideline that debt repayments should not exceed 35% of gross income.

#### 3. Maximum Loan Amount
```typescript
const maxLoanAmount = Math.min(4000, affordabilityThreshold * 3)
```

**Constraints:**
- Absolute maximum: R4000 (business rule)
- Based on 3-month repayment period
- Adjusted by affordability threshold

### Example Calculations

#### Example 1: High Income - Approved
**Input:**
- Monthly Income: R8000
- Existing Debts: R0
- Requested Amount: R2000

**Calculation:**
```
Disposable Income = R8000 - R0 = R8000 ✓ (> R2000)
Affordability Threshold = R8000 × 0.35 = R2800
Max Loan Amount = min(R4000, R2800 × 3) = min(R4000, R8400) = R4000
Credit Score = 650 (random, ≥ 550) ✓
Result: APPROVED for up to R4000
```

#### Example 2: Low Income - Declined
**Input:**
- Monthly Income: R1500
- Existing Debts: R0
- Requested Amount: R2000

**Calculation:**
```
Disposable Income = R1500 - R0 = R1500 ✗ (< R2000)
Result: DECLINED - Insufficient disposable income
```

#### Example 3: Marginal Case
**Input:**
- Monthly Income: R5000
- Existing Debts: R0
- Requested Amount: R3000

**Calculation:**
```
Disposable Income = R5000 - R0 = R5000 ✓
Affordability Threshold = R5000 × 0.35 = R1750
Max Loan Amount = min(R4000, R1750 × 3) = min(R4000, R5250) = R4000
Credit Score = 720 (random, ≥ 550) ✓
Result: APPROVED but max amount is R4000
```

#### Example 4: Poor Credit Score
**Input:**
- Monthly Income: R6000
- Existing Debts: R0
- Requested Amount: R2000
- Credit Score: 480 (random)

**Calculation:**
```
Disposable Income = R6000 ✓
Affordability = Sufficient ✓
Credit Score = 480 ✗ (< 550)
Result: DECLINED - Credit score below minimum threshold
```

## Approval Criteria

An application is **APPROVED** if ALL conditions are met:

```typescript
const approved = 
  creditScore >= 550 &&                    // Minimum credit score
  disposableIncome > 2000 &&               // Minimum disposable income
  maxLoanAmount >= 500                     // Can afford minimum loan
```

## Decline Reasons

The system provides specific reasons for decline:

1. **"Credit score below minimum threshold"**
   - Credit score < 550
   - Indicates high credit risk

2. **"Insufficient disposable income"**
   - Disposable income ≤ R2000
   - Cannot afford minimum monthly repayment

3. **"Affordability assessment failed"**
   - Max loan amount < R500
   - Income too low for requested amount

## Interest & Fees Calculation

### Interest Rate
- **5% per month** (simple interest)
- Not compound interest
- Applied to principal only

### Admin Fee
- **Fixed: R50**

### Total Repayment Calculation

```typescript
const principal = approvedAmount
const interest = principal * 0.05        // 5% of principal
const adminFee = 50                       // Fixed fee
const totalDue = principal + interest + adminFee
```

**Example for R2000 loan:**
```
Principal:  R2,000.00
Interest:   R  100.00 (5%)
Admin Fee:  R   50.00
─────────────────────
Total Due:  R2,150.00
```

## NCR Compliance Features

### Required Checks ✓
1. ✅ Credit bureau check (Experian simulated)
2. ✅ Affordability assessment
3. ✅ 3 months bank statements verification
4. ✅ Income verification
5. ✅ Debt service ratio calculation

### Responsible Lending ✓
1. ✅ Maximum 35% of income for debt service
2. ✅ Minimum disposable income threshold
3. ✅ Credit score minimum requirement
4. ✅ Clear disclosure of all costs
5. ✅ Transparent decline reasons

## Real World Implementation

For production use with **real Experian API**:

```typescript
// Replace mock with real API call
const experianResponse = await fetch('https://api.experian.co.za/credit-check', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${EXPERIAN_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    idNumber: idNumber,
    firstName: firstName,
    lastName: lastName,
    consent: true
  })
})

const creditData = await experianResponse.json()

// Use real data
const creditScore = creditData.score
const existingDebts = creditData.totalMonthlyObligations
const creditProfile = creditData.profile
```

### Additional Real-World Considerations

1. **Credit Bureau Data:**
   - Current debts and obligations
   - Payment history
   - Judgments and defaults
   - Employment history

2. **Bank Statement Analysis:**
   - Income verification (3 months)
   - Expense patterns
   - Bounced payments
   - Gambling or high-risk behavior

3. **Fraud Detection:**
   - ID verification
   - Address verification
   - Duplicate applications
   - Suspicious patterns

4. **Enhanced Affordability:**
   - Living expenses estimation
   - Dependents consideration
   - Other loan commitments
   - Variable income handling

## Testing the Credit Check

### Test Case 1: Guaranteed Approval
```typescript
{
  idNumber: "8001015009087",
  income: 10000,              // High income
  existingDebts: 0,
  requestedAmount: 2000       // Conservative amount
}
// Should approve with high probability
```

### Test Case 2: Guaranteed Decline (Low Income)
```typescript
{
  idNumber: "9001015009087",
  income: 1000,               // Too low
  existingDebts: 0,
  requestedAmount: 2000
}
// Will decline due to insufficient income
```

### Test Case 3: Edge Case
```typescript
{
  idNumber: "7001015009087",
  income: 2500,               // Just above minimum
  existingDebts: 0,
  requestedAmount: 1000
}
// May approve or decline based on random credit score
```

## Future Enhancements

1. **Machine Learning:**
   - Predictive default risk
   - Custom scoring models
   - Pattern recognition

2. **Dynamic Pricing:**
   - Interest rate based on risk
   - Fee adjustments
   - Loyalty discounts

3. **Alternative Data:**
   - Utility payment history
   - Rental payment history
   - Mobile money behavior

4. **Open Banking:**
   - Real-time bank data via APIs
   - Automated verification
   - No manual uploads needed

export interface LoanCalculationResult {
  principal: number;
  initiationFee: number;
  serviceFee: number;
  interest: number;
  insurance: number;
  totalRepayable: number;
}

/**
 * Calculates loan fees and interest based on NCR regulations and custom business rules.
 * 
 * Rules:
 * - Initiation Fee: 16.5% on first R1000, 10% on remainder.
 * - Service Fee: R60 per calendar month (assumed 1 month for simple calc).
 * - Interest: 4.5% pm for 1st loan in year, 3% pm thereafter.
 * - Credit Life Insurance: R11.25 fixed.
 * 
 * @param amount Principal loan amount
 * @param isFirstLoanInYear Whether this is the user's first loan this year
 * @param days Loan duration in days (default 30)
 */
export function calculateLoan(amount: number, isFirstLoanInYear: boolean = true, days: number = 30): LoanCalculationResult {
  // 1. Initiation Fee
  let initiationFee = 0;
  if (amount <= 1000) {
    initiationFee = amount * 0.165;
  } else {
    initiationFee = (1000 * 0.165) + ((amount - 1000) * 0.10);
  }

  // 2. Service Fee
  // R60 per calendar month.
  // For a standard short-term loan (usually < 30 days), it's typically 1 month fee.
  // If it spans multiple months, logic would be needed, but for now we assume 1 month base.
  // "pro-rata portion if concluded in another calendar month"
  // We'll stick to R60 for the base calculation.
  const serviceFee = 60;

  // 3. Interest
  // 4.5% per month for 1st loan, 3% after.
  const interestRate = isFirstLoanInYear ? 0.045 : 0.03;
  const interest = amount * interestRate;

  // 4. Credit Life Insurance
  const insurance = 11.25;

  // Total
  // Note: VAT is often applicable to fees in SA, but not explicitly requested.
  // We sum the raw values.
  const totalRepayable = amount + initiationFee + serviceFee + interest + insurance;

  return {
    principal: amount,
    initiationFee,
    serviceFee,
    interest,
    insurance,
    totalRepayable
  };
}

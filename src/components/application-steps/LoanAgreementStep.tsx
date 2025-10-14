import { useState } from 'react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Card, CardContent } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { FileText, AlertCircle } from 'lucide-react'

interface LoanAgreementStepProps {
  applicationData: any
  creditReport: any
  onComplete: () => void
}

export function LoanAgreementStep({ applicationData, creditReport, onComplete }: LoanAgreementStepProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [signed, setSigned] = useState(false)

  const loanAmount = creditReport.maxLoanAmount
  const interestRate = 0.05
  const interest = loanAmount * interestRate
  const fees = 50
  const totalDue = loanAmount + interest + fees
  const repaymentDate = new Date()
  repaymentDate.setMonth(repaymentDate.getMonth() + 1)

  const handleSign = () => {
    if (acceptedTerms) {
      setSigned(true)
      // In a real app, you would send an OTP or use e-signature
      setTimeout(() => {
        onComplete()
      }, 1000)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Please review your loan agreement carefully before signing.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <h4 className="text-center mb-6">LOAN AGREEMENT</h4>
          
          <div className="space-y-4 mb-6">
            <div className="border-b pb-2">
              <h5 className="text-sm mb-2">Borrower Details</h5>
              <p className="text-sm"><strong>Name:</strong> {applicationData.fullName}</p>
              <p className="text-sm"><strong>ID Number:</strong> {applicationData.idNumber}</p>
              <p className="text-sm"><strong>Email:</strong> {applicationData.email}</p>
            </div>

            <div className="border-b pb-2">
              <h5 className="text-sm mb-2">Loan Details</h5>
              <p className="text-sm"><strong>Principal Amount:</strong> R{loanAmount.toLocaleString()}</p>
              <p className="text-sm"><strong>Interest Rate:</strong> 5% per month</p>
              <p className="text-sm"><strong>Interest Amount:</strong> R{interest.toFixed(2)}</p>
              <p className="text-sm"><strong>Admin Fee:</strong> R{fees.toFixed(2)}</p>
              <p className="text-sm"><strong>Total Amount Due:</strong> R{totalDue.toFixed(2)}</p>
              <p className="text-sm"><strong>Repayment Date:</strong> {repaymentDate.toLocaleDateString()}</p>
            </div>

            <div className="border-b pb-2">
              <h5 className="text-sm mb-2">Banking Details</h5>
              <p className="text-sm"><strong>Bank:</strong> {applicationData.bankName}</p>
              <p className="text-sm"><strong>Account Type:</strong> {applicationData.accountType}</p>
              <p className="text-sm"><strong>Account Number:</strong> {applicationData.accountNumber}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 mb-6">
            <h5 className="mb-2">Terms & Conditions</h5>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>The loan amount will be paid into your nominated bank account within 24 hours.</li>
              <li>Repayment will be collected via debit order on the agreed repayment date.</li>
              <li>Early settlement is allowed with no penalties.</li>
              <li>Late payments may incur additional fees and affect your credit record.</li>
              <li>This agreement is subject to the National Credit Act and NCR regulations.</li>
              <li>You have the right to cancel this agreement within 5 business days (cooling-off period).</li>
            </ol>
          </div>

          <div className="flex items-start space-x-2 mb-4">
            <Checkbox
              id="acceptTerms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <label htmlFor="acceptTerms" className="text-sm cursor-pointer">
              I have read, understood, and agree to the terms and conditions of this loan agreement.
              I confirm that all information provided is accurate and complete.
            </label>
          </div>

          {signed ? (
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                Agreement signed successfully! Redirecting to your dashboard...
              </AlertDescription>
            </Alert>
          ) : (
            <Button
              className="w-full"
              onClick={handleSign}
              disabled={!acceptedTerms}
            >
              Sign Agreement (OTP Verification)
            </Button>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>NCR Compliant:</strong> This loan agreement complies with the National Credit Act.
          You have 5 business days to cancel this agreement without penalty.
        </AlertDescription>
      </Alert>
    </div>
  )
}
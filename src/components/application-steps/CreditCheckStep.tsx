import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'

interface CreditCheckStepProps {
  creditReport: any
}

export function CreditCheckStep({ creditReport }: CreditCheckStepProps) {
  const isApproved = creditReport.approved

  return (
    <div className="space-y-6">
      <div className={`border-2 rounded-lg p-6 text-center ${
        isApproved ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
      }`}>
        {isApproved ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl mb-2 text-green-900">
              Good News - You're Approved!
            </h3>
            <p className="text-green-800">
              Congratulations! You qualify for a loan based on our affordability assessment.
            </p>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-2xl mb-2 text-red-900">
              Application Declined
            </h3>
            <p className="text-red-800">
              Unfortunately, we can't approve your application at this time due to affordability rules.
            </p>
          </>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h4 className="mb-4">Credit Assessment Results</h4>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Credit Score</span>
              <span className={creditReport.creditScore >= 550 ? 'text-green-600' : 'text-red-600'}>
                {creditReport.creditScore}
              </span>
            </div>
            
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Disposable Income</span>
              <span>R{creditReport.disposableIncome.toLocaleString()}</span>
            </div>

            {isApproved && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Maximum Approved Amount</span>
                <span className="text-green-600">
                  R{creditReport.maxLoanAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status</span>
              <span className={isApproved ? 'text-green-600' : 'text-red-600'}>
                {isApproved ? 'Approved' : 'Declined'}
              </span>
            </div>

            <div className="pt-3">
              <span className="text-sm text-gray-600">Reason:</span>
              <p className="text-sm mt-1">{creditReport.reason}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isApproved ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Click "Next" to review and sign your loan agreement. Funds will be disbursed within 24 hours
            after you sign the agreement.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're welcome to apply again in the future. Consider improving your credit score or
            reducing existing debt obligations to increase your chances of approval.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
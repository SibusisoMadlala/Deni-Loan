import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'

interface CreditCheckStepProps {
  creditReport: any
}

export function CreditCheckStep({ creditReport }: CreditCheckStepProps) {
  const isApproved = creditReport.approved
  const isRealExperian = creditReport.source === 'experian'

  // Credit risk badge color
  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'excellent':
        return 'text-blue-600 bg-blue-50'
      case 'good':
        return 'text-green-600 bg-green-50'
      case 'fair':
        return 'text-yellow-600 bg-yellow-50'
      case 'poor':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

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

      {isRealExperian && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This assessment was performed using real Experian credit data.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="pt-6">
          <h4 className="mb-4 font-semibold">Credit Assessment Results</h4>
          <div className="space-y-3">
            {/* Credit Score */}
            <div className="flex justify-between py-2 border-b items-center">
              <span className="text-gray-600">Credit Score</span>
              <div className="flex items-center gap-2">
                <span className={creditReport.creditScore >= 550 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {creditReport.creditScore}
                </span>
                {creditReport.creditRisk && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(creditReport.creditRisk)}`}>
                    {creditReport.creditRisk}
                  </span>
                )}
              </div>
            </div>
            
            {/* Disposable Income */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Monthly Disposable Income</span>
              <span className={creditReport.disposableIncome > 2000 ? 'text-green-600' : 'text-red-600'}>
                R{creditReport.disposableIncome.toLocaleString()}
              </span>
            </div>

            {/* Existing Obligations */}
            {creditReport.existingObligations !== undefined && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Existing Monthly Obligations</span>
                <span>R{creditReport.existingObligations.toLocaleString()}</span>
              </div>
            )}

            {/* Maximum Approved Amount */}
            {isApproved && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Maximum Approved Amount</span>
                <span className="text-green-600 font-semibold">
                  R{creditReport.maxLoanAmount.toLocaleString()}
                </span>
              </div>
            )}

            {/* Status */}
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Status</span>
              <span className={isApproved ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {isApproved ? 'Approved' : 'Declined'}
              </span>
            </div>

            {/* Reason */}
            <div className="pt-3">
              <span className="text-sm text-gray-600">Assessment Reason:</span>
              <p className="text-sm mt-1 font-medium">{creditReport.reason}</p>
            </div>

            {/* Additional Credit Profile Info (from real Experian) */}
            {isRealExperian && creditReport.numberOfAccounts !== undefined && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="text-sm font-semibold mb-3 text-gray-700">Credit Profile Summary</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Active Accounts</p>
                    <p className="text-lg font-semibold">{creditReport.numberOfAccounts || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Defaulted Accounts</p>
                    <p className={`text-lg font-semibold ${creditReport.defaultedAccounts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {creditReport.defaultedAccounts || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Judgments</p>
                    <p className={`text-lg font-semibold ${creditReport.judgments > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {creditReport.judgments || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600">Admin Orders</p>
                    <p className={`text-lg font-semibold ${creditReport.administrationOrders > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {creditReport.administrationOrders || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
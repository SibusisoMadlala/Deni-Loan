import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loanService } from '../services/loanService'
import { documentService } from '../services/documentService'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { PersonalDetailsStep } from './application-steps/PersonalDetailsStep'
import { WorkIncomeStep } from './application-steps/WorkIncomeStep'
import { BankingDetailsStep } from './application-steps/BankingDetailsStep'
import { DocumentUploadStep } from './application-steps/DocumentUploadStep'
import { Alert, AlertDescription } from './ui/alert'
import { CheckCircle } from 'lucide-react'
import { AlertCircle } from 'lucide-react'

const STEPS = [
  'Personal Details',
  'Work & Income',
  'Banking Details',
  'Upload Documents',
  'Application Sent'
]

export function LoanApplicationPage() {
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasActiveApprovedLoan, setHasActiveApprovedLoan] = useState(false)
  const [checkingApplications, setCheckingApplications] = useState(true)
  const [isFirstLoanInYear, setIsFirstLoanInYear] = useState(true) // Default to true
  const [isDocumentsValid, setIsDocumentsValid] = useState(false)
  
  const [applicationData, setApplicationData] = useState<any>({
    idNumber: '',
    fullName: '',
    phone: '',
    email: '',
    employerName: '',
    employerAddress: '',
    nextPayDate: '',
    paydayCycle: 'monthly',
    netSalary: 0,
    bankName: '',
    accountType: 'cheque',
    branchCode: '',
    accountNumber: '',
    requestedAmount: 2000,
    acceptPOPIA: false,
    acceptExperian: false
  })

  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [creditReport, setCreditReport] = useState<any>(null)

  // Prepopulate form with user profile data
  useEffect(() => {
    if (user) {
      setApplicationData(prevData => ({
        ...prevData,
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email || ''
      }))
    }
  }, [user])

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

      // Check if first loan in calendar year
      const currentYear = new Date().getFullYear()
      const hasLoanInYear = apps.some(app => {
        const appDate = new Date(app.createdAt || '')
        return appDate.getFullYear() === currentYear && (app.status === 'repaid' || app.status === 'disbursed' || app.status === 'approved')
      })
      setIsFirstLoanInYear(!hasLoanInYear)

    } catch (err) {
      console.error('Failed to check applications:', err)
    } finally {
      setCheckingApplications(false)
    }
  }

  const updateData = (newData: any) => {
    setApplicationData({ ...applicationData, ...newData })
  }

  const handleNext = async () => {
    setError('')
    
    // Validate current step before proceeding
    if (currentStep === 0) {
      if (!applicationData.idNumber || !applicationData.fullName || !applicationData.phone || !applicationData.email) {
        setError('Please fill in all required fields')
        return
      }
      if (!applicationData.acceptPOPIA || !applicationData.acceptExperian) {
        setError('Please accept the required consents')
        return
      }
    }

    if (currentStep === 1) {
      if (!applicationData.employerName || !applicationData.netSalary) {
        setError('Please fill in all required fields')
        return
      }
      if (applicationData.netSalary < 2000) {
        setError('Minimum net salary requirement is R2000')
        return
      }
    }

    if (currentStep === 2) {
      if (!applicationData.bankName || !applicationData.accountNumber || !applicationData.branchCode) {
        setError('Please fill in all banking details')
        return
      }
    }

    // Create application after step 3 (before documents)
    if (currentStep === 2 && !applicationId) {
      setLoading(true)
      try {
        const result = await loanService.createApplication(applicationData, accessToken!)
        setApplicationId(result.application.id)
      } catch (err: any) {
        setError(err.message || 'Failed to create application')
        setLoading(false)
        return
      }
      setLoading(false)
    }

    // Submit application after documents (Step 3)
    if (currentStep === 3) {
      if (!isDocumentsValid) {
        setError('Please upload all required documents (ID, Bank Statement, Proof of Residence, Payslip) before proceeding.')
        return
      }

      if (!applicationId) {
        setError('Application ID is missing')
        return
      }

      setLoading(true)
      try {
        // Just update status to pending to trigger email
        await loanService.updateApplication(
          applicationId,
          { status: 'pending' },
          accessToken!
        )
        setLoading(false)
        setCurrentStep(4) // Explicitly move to success step
        return
      } catch (err: any) {
        setError(err.message || 'Failed to submit application')
        setLoading(false)
        return
      }
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    navigate('/dashboard')
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  // Show loading while checking for active loans
  if (checkingApplications) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Block if user has active approved/disbursed loan
  if (hasActiveApprovedLoan) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Active Loan in Progress</CardTitle>
              <CardDescription>
                You cannot apply for a new loan while you have an active approved loan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>You currently have an active approved or disbursed loan.</strong>
                  <br />
                  <br />
                  To apply for a new loan, you must:
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Complete payment of your current loan by the next pay day</li>
                    <li>Once fully repaid, you can apply for a new loan</li>
                  </ol>
                </AlertDescription>
              </Alert>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Need help?</strong> Go to your dashboard to view your active loan details and make payments.
                </p>
              </div>

              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Loan Application</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
            </CardDescription>
            <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentStep === 0 && (
              <PersonalDetailsStep data={applicationData} updateData={updateData} />
            )}
            {currentStep === 1 && (
              <WorkIncomeStep data={applicationData} updateData={updateData} />
            )}
            {currentStep === 2 && (
              <BankingDetailsStep data={applicationData} updateData={updateData} />
            )}
            {currentStep === 3 && applicationId && (
              <DocumentUploadStep 
                applicationId={applicationId} 
                accessToken={accessToken!}
                onValidationChange={setIsDocumentsValid}
              />
            )}
            {currentStep === 4 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h3>
                <p className="text-gray-600 mb-8 max-w-md">
                  Your loan application has been successfully submitted. 
                  We have sent a confirmation email to <span className="font-medium text-gray-900">{applicationData.email}</span>.
                  Our team will review your documents and get back to you shortly.
                </p>
                <Button onClick={handleComplete} size="lg" className="w-full max-w-xs">
                  Go to Dashboard
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              {currentStep < 4 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                >
                  Back
                </Button>
              )}
              
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={loading}>
                  {loading ? 'Processing...' : 'Next'}
                </Button>
              ) : currentStep === 3 ? (
                <Button onClick={handleNext} disabled={loading}>
                  Submit Application
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
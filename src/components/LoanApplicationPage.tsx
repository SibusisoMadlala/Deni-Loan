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
import { toast } from 'sonner'

const STEPS = [
  'Personal Details',
  'Work & Income',
  'Banking Details',
  'Upload Documents'
]

export function LoanApplicationPage() {
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasActiveApprovedLoan, setHasActiveApprovedLoan] = useState(false)
  const [isInCoolingOffPeriod, setIsInCoolingOffPeriod] = useState(false)
  const [coolingOffDate, setCoolingOffDate] = useState<Date | null>(null)
  const [checkingApplications, setCheckingApplications] = useState(true)
  const [isFirstLoanInYear, setIsFirstLoanInYear] = useState(true) // Default to true
  const [isDocumentsValid, setIsDocumentsValid] = useState(false)
  
  const [applicationData, setApplicationData] = useState<any>({
    title: '',
    idNumber: '',
    fullName: '',
    maritalStatus: '',
    phone: '',
    email: '',
    nextOfKin: {
      name: '',
      surname: '',
      relation: '',
      phoneNumber: '',
      phoneType: 'Mobile',
      email: ''
    },
    employerName: '',
    employerAddress: '',
    employerPhone: '',
    nextPayDate: '',
    paydayCycle: 'monthly',
    netSalary: 0,
    bankName: '',
    accountType: 'cheque',
    branchCode: '',
    accountNumber: '',
    requestedAmount: 2000,
    repaymentMonths: 1,
    acceptPOPIA: false,
    acceptExperian: false
  })

  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [creditReport, setCreditReport] = useState<any>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | File[]>>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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
      const hasActive = apps.some((app: any) => 
        ['pending', 'approved', 'disbursed'].includes(app.status)
      )
      
      setHasActiveApprovedLoan(hasActive)

      // Check for existing draft application to resume/prevent duplicates
      const draftApp = apps
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .find((app: any) => app.status === 'draft')
      
      if (draftApp) {
        console.log('Found existing draft application:', draftApp.id)
        setApplicationId(draftApp.id)
        // detailed population of form data would be ideal here if needed
      }

      // Check for cooling off period (30 days from last repayment) - DISABLED
      /*
      const repaidLoans = apps
        .filter((app: any) => app.status === 'repaid' && app.updatedAt)
        .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      
      if (repaidLoans.length > 0) {
        const lastRepaymentDate = new Date(repaidLoans[0].updatedAt)
        // Check if less than 30 days passed since repayment
        const thirtyDaysLater = new Date(lastRepaymentDate)
        thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30)
        
        if (new Date() < thirtyDaysLater) {
            setIsInCoolingOffPeriod(true)
            setCoolingOffDate(thirtyDaysLater)
        }
      }
      */

      // Check if first loan in calendar year
      const currentYear = new Date().getFullYear()
      const hasLoanInYear = apps.some((app: any) => {
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

  const handleFileSelect = (file: File | File[], type: string) => {
    setSelectedFiles(prev => ({ ...prev, [type]: file }))
  }

  const handleNext = async () => {
    setError('')
    setFieldErrors({})
    const errors: Record<string, string> = {}
    
    // Validate current step before proceeding
    if (currentStep === 0) {
      if (!applicationData.requestedAmount) errors.requestedAmount = 'Requested Amount is required'
      if (!applicationData.repaymentMonths) errors.repaymentMonths = 'Repayment Term is required'
      if (!applicationData.idNumber) errors.idNumber = 'ID Number is required'
      if (!applicationData.fullName) errors.fullName = 'Full Name is required'
      if (!applicationData.phone) errors.phone = 'Phone Number is required'
      if (!applicationData.email) errors.email = 'Email is required'
      
      const nok = applicationData.nextOfKin
      if (!nok?.name) errors.nokName = 'Next of Kin Name is required'
      if (!nok?.surname) errors.nokSurname = 'Next of Kin Surname is required'
      if (!nok?.relation) errors.nokRelation = 'Next of Kin Relation is required'
      if (!nok?.phoneNumber) errors.nokPhone = 'Next of Kin Phone is required'
      if (!nok?.email) errors.nokEmail = 'Next of Kin Email is required'
      
      if (!applicationData.acceptPOPIA) errors.acceptPOPIA = 'You must accept the POPIA consent'
      if (!applicationData.acceptExperian) errors.acceptExperian = 'You must accept the Credit Check consent'
    }

    if (currentStep === 1) {
      if (!applicationData.employerName) errors.employerName = 'Employer Name is required'
      if (!applicationData.employerAddress) errors.employerAddress = 'Employer Address is required'
      if (!applicationData.employerPhone) errors.employerPhone = 'Employer Phone is required'
      if (!applicationData.nextPayDate) errors.nextPayDate = 'Next Pay Date is required'
      if (!applicationData.paydayCycle) errors.paydayCycle = 'Payday Frequency is required'
      if (!applicationData.netSalary) errors.netSalary = 'Net Salary is required'
      else if (applicationData.netSalary < 2000) errors.netSalary = 'Minimum net salary requirement is R2000'
    }

    if (currentStep === 2) {
      if (!applicationData.bankName) errors.bankName = 'Bank Name is required'
      if (!applicationData.accountNumber) errors.accountNumber = 'Account Number is required'
      if (!applicationData.branchCode) errors.branchCode = 'Branch Code is required'
    }

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error('Please fix the highlighted errors before proceeding')
      return
    }

    // Submit application after documents (Step 3)
    if (currentStep === 3) {
      if (!isDocumentsValid) {
        toast.error('Please upload all required documents (ID, Bank Statement, Proof of Residence, Payslip) before proceeding.')
        return
      }

      setLoading(true)
      try {
        let newAppId = applicationId;

        // 1. Create or Update Application
        if (!newAppId) {
          const result = await loanService.createApplication(applicationData, accessToken!)
          newAppId = result.application.id
          setApplicationId(newAppId)
        } else {
          // If draft exists, update it with latest data
          await loanService.updateApplication(newAppId, applicationData, accessToken!)
        }

        // 2. Upload Documents
        for (const [type, files] of Object.entries(selectedFiles)) {
           if (Array.isArray(files)) {
             for (const file of files) {
               await documentService.uploadDocument(file, newAppId, type, accessToken!)
             }
           } else {
             await documentService.uploadDocument(files as File, newAppId, type, accessToken!)
           }
        }

        // 3. Update status to pending
        await loanService.updateApplication(
          newAppId,
          { status: 'pending' },
          accessToken!
        )
        setLoading(false)
        navigate('/application-success', { state: { email: applicationData.email } })
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

  const calculateProgress = () => {
    return ((currentStep + 1) / STEPS.length) * 100
  }

  const progress = calculateProgress()

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

  // Block if user is in cooling-off period
  if (isInCoolingOffPeriod) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cooling-Off Period Active</CardTitle>
              <CardDescription>
                You recently repaid a loan. Please wait before applying again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Application Restricted</strong>
                  <br />
                  <br />
                  As part of our responsible lending policy, there is a 30-day cooling-off period after repaying a loan.
                  <br />
                  You can apply again on: <strong>{coolingOffDate?.toLocaleDateString()}</strong>
                </AlertDescription>
              </Alert>

              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Return to Dashboard
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
              <PersonalDetailsStep 
                data={applicationData} 
                updateData={updateData} 
                errors={fieldErrors}
              />
            )}
            {currentStep === 1 && (
              <WorkIncomeStep 
                data={applicationData} 
                updateData={updateData} 
                errors={fieldErrors}
              />
            )}
            {currentStep === 2 && (
              <BankingDetailsStep 
                data={applicationData} 
                updateData={updateData} 
                errors={fieldErrors}
              />
            )}
            {currentStep === 3 && (
              <DocumentUploadStep 
                applicationId={null} 
                accessToken={accessToken!}
                onValidationChange={setIsDocumentsValid}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
              />
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

        <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100 max-w-3xl mx-auto">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 text-center">Loan Terms and Disclosures</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs text-gray-600">
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <span className="font-medium text-gray-900 mb-1">Minimum Repayment</span>
              <span>61 Days</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <span className="font-medium text-gray-900 mb-1">Maximum Repayment</span>
              <span>3 Months</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
              <span className="font-medium text-gray-900 mb-1">NCR Registration</span>
              <span>NCRCP22836</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
             <div className="text-xs text-gray-500 text-center space-y-2">
                <p><strong>Representation of Cost:</strong> Annual Percentage Rate (APR) varies based on your credit profile and loan amount, up to a maximum of 158% (including fees).
                The APR includes the interest rate plus fees and other costs for a year, calculated consistently with local law.</p>
                <p><strong>Representative Example:</strong> For a loan of R2,000 repaid over 3 months, the total repayment amount would be R2,778.75. This includes Interest of R300.00, Initiation Fee of R265.00, Monthly Service Fee of R60.00 pm, and Credit Life Insurance where applicable. 
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
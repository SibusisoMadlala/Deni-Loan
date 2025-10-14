import { useState } from 'react'
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
import { CreditCheckStep } from './application-steps/CreditCheckStep'
import { LoanAgreementStep } from './application-steps/LoanAgreementStep'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'

const STEPS = [
  'Personal Details',
  'Work & Income',
  'Banking Details',
  'Upload Documents',
  'Credit Check',
  'Loan Agreement'
]

export function LoanApplicationPage() {
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [applicationData, setApplicationData] = useState<any>({
    idNumber: '',
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    employerName: '',
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

    // Perform credit check after documents
    if (currentStep === 3 && !creditReport) {
      setLoading(true)
      try {
        const report = await loanService.performCreditCheck(
          applicationData.idNumber,
          applicationData.netSalary,
          0, // existing debts - could be added to form
          accessToken!
        )
        setCreditReport(report)
        
        // Update application with credit check results
        await loanService.updateApplication(
          applicationId!,
          {
            creditScore: report.creditScore,
            creditCheckPassed: report.approved,
            approvedAmount: report.approved ? report.maxLoanAmount : 0,
            declineReason: report.approved ? undefined : report.reason,
            status: report.approved ? 'approved' : 'declined'
          },
          accessToken!
        )
      } catch (err: any) {
        setError(err.message || 'Credit check failed')
        setLoading(false)
        return
      }
      setLoading(false)
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

  const handleComplete = async () => {
    // Update application to disbursed status
    if (applicationId) {
      await loanService.updateApplication(
        applicationId,
        { status: 'disbursed' },
        accessToken!
      )
    }
    navigate('/dashboard')
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

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
              />
            )}
            {currentStep === 4 && creditReport && (
              <CreditCheckStep creditReport={creditReport} />
            )}
            {currentStep === 5 && creditReport?.approved && (
              <LoanAgreementStep 
                applicationData={applicationData}
                creditReport={creditReport}
                onComplete={handleComplete}
              />
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0 || loading}
              >
                Back
              </Button>
              
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext} disabled={loading}>
                  {loading ? 'Processing...' : 'Next'}
                </Button>
              ) : (
                creditReport?.approved && (
                  <Button onClick={handleComplete} disabled={loading}>
                    Complete Application
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
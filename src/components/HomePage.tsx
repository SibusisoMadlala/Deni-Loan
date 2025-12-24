import { SetStateAction, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Shield, CheckCircle, FileCheck, Lock } from 'lucide-react'
import { calculateLoan } from '../utils/loanCalculator'
import NCRLogo from '../assets/NCRlogoV.png'
import ExperianLogo from '../assets/ExperianLogo.png'
import MSECALogo from '../assets/MSECALogo.png'

export function HomePage() {
  const navigate = useNavigate()
  const [loanAmount, setLoanAmount] = useState(2000)

  // Calculate loan details
  const { interest, initiationFee, serviceFee, insurance, totalRepayable } = calculateLoan(loanAmount, true)
  const totalFees = initiationFee + serviceFee + insurance

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl mb-4 text-gray-900">
            Borrow R500 – R4000
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-2">
            Quick approvals. Transparent repayments.
          </p>
          <p className="text-lg text-gray-500">
            Get the cash you need today, with clear terms and fair rates
          </p>
        </div>

        {/* Loan Calculator */}
        <Card className="max-w-2xl mx-auto mb-12 shadow-lg">
          <CardHeader>
            <CardTitle>Calculate Your Loan</CardTitle>
            <CardDescription>
              Adjust the slider to see how much you can borrow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Loan Amount</span>
                <span className="text-3xl text-blue-600">R{loanAmount.toLocaleString()}</span>
              </div>
              <Slider
                value={[loanAmount]}
                onValueChange={(value: SetStateAction<number>[]) => setLoanAmount(value[0])}
                min={500}
                max={4000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>R500</span>
                <span>R4000</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Principal Amount</span>
                <span>R{loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interest (4.5%)</span>
                <span>R{interest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Initiation Fee</span>
                <span>R{initiationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service Fee</span>
                <span>R{serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Insurance</span>
                <span>R{insurance.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Total to Repay</span>
                  <span className="text-xl text-blue-600">
                    R{totalRepayable.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full"
              onClick={() => navigate('/apply')}
            >
              Apply Now
            </Button>
          </CardContent>
        </Card>

        {/* Trust Signals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
            <Shield className="w-12 h-12 text-blue-600 mb-3" />
            <h3 className="mb-2">NCR Registered</h3>
            <p className="text-sm text-gray-600">
              Fully compliant with National Credit Regulator standards
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
            <CheckCircle className="w-12 h-12 text-green-600 mb-3" />
            <h3 className="mb-2">Experian Checks</h3>
            <p className="text-sm text-gray-600">
              Responsible lending with proper affordability assessments
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
            <Lock className="w-12 h-12 text-purple-600 mb-3" />
            <h3 className="mb-2">POPIA Compliant</h3>
            <p className="text-sm text-gray-600">
              Your personal data is protected and secure
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm">
            <FileCheck className="w-12 h-12 text-orange-600 mb-3" />
            <h3 className="mb-2">Transparent Terms</h3>
            <p className="text-sm text-gray-600">
              No hidden fees. Clear repayment schedules
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-600">1</span>
              </div>
              <h3 className="mb-2">Apply Online</h3>
              <p className="text-sm text-gray-600">
                Complete our simple application form in minutes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-600">2</span>
              </div>
              <h3 className="mb-2">Instant Decision</h3>
              <p className="text-sm text-gray-600">
                Get approved in minutes with our automated credit checks
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-600">3</span>
              </div>
              <h3 className="mb-2">Get Your Cash</h3>
              <p className="text-sm text-gray-600">
                Funds paid directly to your account within 24 hours
              </p>
            </div>
            
          </div>
        </div>

        {/* Our Partners */}
        <div className="mt-20 mb-12">
          <h2 className="text-3xl text-center mb-10 text-gray-900">Our Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
            <Card className="flex items-center justify-center p-8 hover:shadow-md transition-shadow h-40">
              <img src={NCRLogo} alt="NCR Logo" className="h-full w-full object-contain" />
            </Card>
            <Card className="flex items-center justify-center p-8 hover:shadow-md transition-shadow h-40">
              <img src={ExperianLogo} alt="Experian Logo" className="h-full w-full object-contain" />
            </Card>
            <Card className="flex items-center justify-center p-8 hover:shadow-md transition-shadow h-40">
              <img src={MSECALogo} alt="MSECA Logo" className="h-full w-full object-contain" />
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Deni Loans (Pty)Ltd. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="/terms" className="hover:text-gray-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>

    
  )
}
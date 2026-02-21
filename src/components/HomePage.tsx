import { SetStateAction, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { CheckCircle, FileCheck, Lock, ArrowRight, Zap, Shield, Clock } from 'lucide-react'
import { calculateLoan } from '../utils/loanCalculator'

export function HomePage() {
  const navigate = useNavigate()
  const [loanAmount, setLoanAmount] = useState(2000)
  const [months, setMonths] = useState(1)

  // Calculate loan details
  const { interest, initiationFee, serviceFee, insurance, totalRepayable, monthlyRepayment } = calculateLoan(loanAmount, months, true)
  const totalFees = initiationFee + serviceFee + insurance

  const [showBreakdown, setShowBreakdown] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50">
      {/* Hero Section with Modern Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-700 via-sky-800 to-blue-900">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-600 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                <Zap className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-medium">Fast Approval in 15 Minutes</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                Get Your First Loan 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-200 to-blue-200 mt-2">
                  100% Online
                </span>
              </h1>
              
              <p className="text-xl text-sky-100 leading-relaxed max-w-xl">
                Quick approvals, transparent terms, and no hidden fees. Join thousands of South Africans who trust Deni Loans for their financial needs.
              </p>

              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="font-bold">100% Secure</p>
                    <p className="text-sm text-sky-200">POPIA Compliant</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <p className="font-bold">Same Day</p>
                    <p className="text-sm text-sky-200">Money Transfer</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Loan Calculator Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-blue-400 rounded-3xl blur-2xl opacity-15 transform rotate-6"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-100 to-blue-100 rounded-bl-full opacity-50"></div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-8 relative">
                  Calculate Your Loan
                  <div className="absolute -bottom-3 left-0 w-16 h-1 bg-gradient-to-r from-sky-600 to-blue-600 rounded-full"></div>
                </h3>

                {/* Loan Amount Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-5">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Loan Amount</label>
                    <div className="text-right">
                      <span className="text-5xl font-extrabold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">
                        R{loanAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Slider
                    value={[loanAmount]}
                    onValueChange={(value: SetStateAction<number>[]) => setLoanAmount(value[0])}
                    min={500}
                    max={4000}
                    step={100}
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mt-3">
                    <span>R500</span>
                    <span>R4000</span>
                  </div>
                </div>

                {/* Repayment Term Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-5">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">Repayment Term</label>
                    <span className="text-3xl font-extrabold text-gray-800">
                      {months} Month{months > 1 ? 's' : ''}
                    </span>
                  </div>
                  <Slider
                    value={[months]}
                    onValueChange={(value: SetStateAction<number>[]) => setMonths(value[0])}
                    min={1}
                    max={3}
                    step={1}
                    className="w-full h-3"
                  />
                  <div className="flex justify-between text-xs font-semibold text-gray-400 mt-3">
                    <span>1 Month</span>
                    <span>3 Months</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">* Min repayment period: 61 days.</p>
                </div>
                
                {/* Repayment Summary */}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 mb-6 border-2 border-sky-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-700 font-semibold">Total Repayment:</span>
                    <span className="text-3xl font-black text-gray-900">
                      R{totalRepayable.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </span>
                  </div>
                  <button 
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="text-sm text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1 group"
                  >
                    {showBreakdown ? 'Hide Breakdown' : 'View Cost Breakdown'}
                    <ArrowRight className={`w-4 h-4 transition-transform ${showBreakdown ? 'rotate-90' : ''} group-hover:translate-x-1`} />
                  </button>
                  
                  {showBreakdown && (
                    <div className="mt-4 pt-4 border-t border-sky-200 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>Principal Amount:</span>
                        <span className="font-semibold">R{loanAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Interest:</span>
                        <span className="font-semibold">R{interest.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Fees (Init + Service + Insurance):</span>
                        <span className="font-semibold">R{totalFees.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button 
                  className="w-full h-16 text-lg font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transform transition hover:scale-105 rounded-2xl group"
                  onClick={() => navigate('/apply')}
                >
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-center text-xs text-gray-500 mt-4">
                  <CheckCircle className="inline w-4 h-4 text-emerald-500 mr-1" />
                  No impact on credit score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#f8fafc" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold mb-4">
              Why Choose Deni Loans
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the advantage of working with South Africa's most transparent loan provider
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-sky-200 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <FileCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Complete Transparency</h3>
              <p className="text-gray-600 leading-relaxed">
                Once you have accepted the loan conditions, the total cost is always visible from your personal profile. No hidden costs, no surprises.
              </p>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Confidential</h3>
              <p className="text-gray-600 leading-relaxed">
                We guarantee confidentiality and protection of your data using advanced 256-bit encryption and full POPIA compliance.
              </p>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-sky-200 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple & Quick</h3>
              <p className="text-gray-600 leading-relaxed">
                Our application process is quick and easy and can be completed from the comfort of your home in just 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-50 rounded-full blur-3xl opacity-50 -z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 -z-0"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Get Your Loan in 4 Easy Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Lines */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-sky-200 via-blue-200 to-sky-200 -z-10"></div>
            
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-3xl p-8 h-full border-2 border-sky-200 relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 text-[120px] font-black text-sky-100 opacity-50 leading-none -mr-4 -mt-4 group-hover:scale-110 transition-transform">
                  1
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Create Profile</h3>
                  <p className="text-gray-700">
                    Create an online profile on our website by following the simple steps and filling out the form.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 h-full border-2 border-blue-200 relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 text-[120px] font-black text-blue-100 opacity-50 leading-none -mr-4 -mt-4 group-hover:scale-110 transition-transform">
                  2
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Wait for Decision</h3>
                  <p className="text-gray-700">
                    We make use of automated credit checks to safely assess your affordability in minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 h-full border-2 border-emerald-200 relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 text-[120px] font-black text-emerald-100 opacity-50 leading-none -mr-4 -mt-4 group-hover:scale-110 transition-transform">
                  3
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Get Approved</h3>
                  <p className="text-gray-700">
                    If the results of the assessment are favorable, you will receive a loan offer immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-sky-50 to-blue-100 rounded-3xl p-8 h-full border-2 border-sky-200 relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 text-[120px] font-black text-sky-100 opacity-50 leading-none -mr-4 -mt-4 group-hover:scale-110 transition-transform">
                  4
                </div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-sky-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg">
                    4
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Receive Money</h3>
                  <p className="text-gray-700">
                    Accept your credit offer and your loan will be deposited directly into your bank account.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              size="lg" 
              className="px-10 py-6 text-lg font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl rounded-full transform hover:scale-105 transition-all group"
              onClick={() => navigate('/apply')}
            >
              Start Your Application
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-semibold mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900">
              What Our Customers Say
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex text-amber-500 mb-5 text-xl">
                {[1, 2, 3, 4, 5].map((s) => <span key={s}>★</span>)}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "Very helpful service! Needed money urgently for a medical emergency. Deni Loans approved me quickly and funds were in my account same day."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                  JM
                </div>
                <div>
                  <p className="font-bold text-gray-900">Jessica M.</p>
                  <p className="text-sm text-gray-500">Cape Town</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex text-amber-500 mb-5 text-xl">
                {[1, 2, 3, 4, 5].map((s) => <span key={s}>★</span>)}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "Thank you, you help out. I always use the services of your company. Completely satisfied with the level of service."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                  TK
                </div>
                <div>
                  <p className="font-bold text-gray-900">Thabo K.</p>
                  <p className="text-sm text-gray-500">Johannesburg</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="flex text-amber-500 mb-5 text-xl">
                {[1, 2, 3, 4, 5].map((s) => <span key={s}>★</span>)}
              </div>
              <p className="text-gray-700 italic mb-6 leading-relaxed">
                "I received a loan online very quickly and without complications, exactly as you write about it. The repayment terms are clear."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-500 rounded-full flex items-center justify-center text-white font-bold">
                  SL
                </div>
                <div>
                  <p className="font-bold text-gray-900">Sarah L.</p>
                  <p className="text-sm text-gray-500">Durban</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-400">
        {/* Terms & Disclosures */}
        <div className="border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h3 className="text-white text-2xl font-bold mb-8 flex items-center gap-2">
              <FileCheck className="w-6 h-6" />
              Terms & Disclosures
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Minimum Term</p>
                    <p className="text-2xl font-bold text-white">61 Days</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Maximum Term</p>
                    <p className="text-2xl font-bold text-white">90 Days</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Maximum APR</p>
                  <p className="text-3xl font-bold text-white">60%</p>
                </div>
                <p className="text-sm leading-relaxed">
                  Save your precious time and money. No need to visit anywhere to handover documents. Apply from wherever you are.
                  The process of making a decision and transferring money takes from 1 hour.
                  We undertake the responsibility of securing your personal information.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-4">Representative Example:</h4>
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-gray-700 space-y-3 text-sm">
                  <p className="text-white font-semibold border-b border-gray-700 pb-2">For a loan of R2,000 taken over 3 months:</p>
                  <div className="flex justify-between">
                    <span>Initiation Fee:</span>
                    <span className="font-semibold text-white">R265.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Service Fee:</span>
                    <span className="font-semibold text-white">R60.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Interest:</span>
                    <span className="font-semibold text-white">R200.00</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-3 text-base">
                    <span className="text-white font-bold">Total Repayable:</span>
                    <span className="font-bold text-white">R2,900.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Instalment:</span>
                    <span className="font-semibold text-white">R966.00</span>
                  </div>
                  <p className="text-xs opacity-75 italic pt-2 border-t border-gray-700">
                    * Fees include 15% VAT where applicable. Interest rates subject to credit profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <h3 className="text-white text-2xl font-bold mb-4">Deni Loans</h3>
              <p className="mb-6 leading-relaxed">
                Deni Loans (Pty) Ltd is a company duly incorporated and registered under the laws of South Africa. We are committed to responsible lending practices.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="h-16 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[80px]">
                  <span className="text-gray-900 font-bold text-sm">NCR Registered</span>
                </div>
                <div className="h-16 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[80px]">
                  <span className="text-gray-900 font-bold text-sm">Experian</span>
                </div>
                <div className="h-16 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[80px]">
                  <span className="text-gray-900 font-bold text-sm">CASA</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm">
                <p>155 West Street<br/>Sandton, 2196</p>
                <p className="text-sky-400 hover:text-sky-300 transition-colors">
                  support@deniloans.co.za
                </p>
                <p>Mon - Fri<br/>8:00 AM - 5:00 PM</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="/terms" className="hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    PAIA Manual
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Deni Loans (Pty) Ltd. All Rights Reserved.</p>
            <p>
              NCR Registration: <span className="text-white font-semibold">NCRCP22836</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
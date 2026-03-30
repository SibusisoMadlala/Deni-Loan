import { SetStateAction, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { CheckCircle, FileCheck, Lock, ArrowRight, Zap, Shield, Clock, Instagram, Facebook, Link as LinkIcon, Phone, DollarSign, TrendingUp, BarChart2, Users, Percent, RefreshCw, BadgeCheck } from 'lucide-react'
import { calculateLoan } from '../utils/loanCalculator'
import ncrLogo from '../assets/NCRlogoV.png'
import experianLogo from '../assets/ExperianLogo.png'
import casaLogo from '../assets/CASALogo.jpg'

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
              
              
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                Get Your Deni Loan 
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
                

                {/* CTA Button */}
                <Button 
                  className="w-full h-16 text-lg font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transform transition hover:scale-105 rounded-2xl group"
                  onClick={() => navigate('/apply')}
                >
                  Apply Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
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

      {/* Loan Terms and Disclosures Section */}
      <div className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Loan Terms and Disclosures
            </h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-8">
              {/* Minimum Repayment */}
              <div className="flex items-center space-x-4 bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto min-w-[280px]">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Minimum Repayment</p>
                  <p className="text-xl font-bold text-gray-900">61 Days</p>
                </div>
              </div>

              {/* Maximum Repayment */}
              <div className="flex items-center space-x-4 bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto min-w-[280px]">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Maximum Repayment</p>
                  <p className="text-xl font-bold text-gray-900">3 Months</p>
                </div>
              </div>

              {/* NCR Registration */}
              <div className="flex items-center space-x-4 bg-white px-8 py-6 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto min-w-[280px]">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">NCR Registration</p>
                  <p className="text-xl font-bold text-gray-900">NCRCP22836</p>
                </div>
              </div>
            </div>

            {/* APR and Representative Example */}
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-20">
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-sky-100 text-sky-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Example: First Loan
              </h3>
              <ul className="space-y-4 text-gray-700 text-sm">
                <li className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <span>The amount of credit you need is <strong>R2,000</strong>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <span>The term is 90 days, but you decide to repay within <strong>61 days</strong>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <span>The interest rate is 5% per month, plus an initiation fee and a monthly service fee.</span>
                </li>
                <li className="flex gap-3 items-center font-semibold text-gray-900 bg-sky-50 p-3 rounded-xl border border-sky-100">
                  <DollarSign className="w-5 h-5 text-sky-600 shrink-0" />
                  <span>Total Repayment: R2,742</span>
                </li>
              </ul>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Example: Second Loan
              </h3>
              <ul className="space-y-4 text-gray-700 text-sm">
                <li className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>The amount of credit you need is <strong>R3,000</strong>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>The term is 90 days, but you decide to repay within <strong>75 days</strong>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>The interest rate remains 5% per month, with standard fees applied.</span>
                </li>
                <li className="flex gap-3 items-center font-semibold text-gray-900 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <DollarSign className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Total Repayment: R3,890</span>
                </li>
              </ul>
            </div>
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-8 max-w-2xl mx-auto italic">
            * These examples include VAT where applicable. Your actual repayment amount will depend on your approved loan amount, repayment date and individual credit assessment.
          </p>
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

      {/* Investment Proposal Section */}
      <div className="py-24 bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-700 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-sky-500/20 text-sky-300 rounded-full text-sm font-semibold mb-5 border border-sky-500/30">
              <TrendingUp className="w-4 h-4" />
              Annual Investment Opportunity
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
              Grow Your Wealth With
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-300 mt-2">
                Deni Loans
              </span>
            </h2>
            <p className="text-xl text-sky-100/80 max-w-3xl mx-auto leading-relaxed">
              Deni Loans is a fast-growing microfinance company serving over <strong className="text-white">10,000+</strong> clients across South Africa.
              Our structured 12-month investment model gives investors consistent monthly returns through high-velocity capital rotation.
            </p>
          </div>

          {/* Key Highlights */}
          

          {/* How It Works + Example Projection */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Example Projection */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-sky-300" />
                </div>
                <h3 className="text-xl font-bold text-white">R100,000 Example Projection</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Capital Deployed</span>
                  <span className="text-white font-bold">R100,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Return per Cycle (30–40 days)</span>
                  <span className="text-emerald-300 font-bold">R132,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Gross Profit per Cycle</span>
                  <span className="text-emerald-300 font-bold">R32,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Total Gross Revenue (12 cycles)</span>
                  <span className="text-white font-bold">R384,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Net Profit (30% of revenue)</span>
                  <span className="text-white font-bold">R115,200</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-sky-500/10 rounded-2xl px-4 mt-2">
                  <span className="text-sky-100 font-semibold">Your Annual Investor Share (25%)</span>
                  <span className="text-2xl font-extrabold text-sky-300">R28,800</span>
                </div>
              </div>
            </div>

            {/* Profit Sharing + Terms */}
            <div className="flex flex-col gap-6">
              {/* Profit Sharing */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Profit Sharing Model</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-sky-900/50 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-slate-400 to-slate-500 h-full rounded-full" style={{width: '70%'}}></div>
                    </div>
                    <span className="text-sky-200 text-sm w-40">70% — Operations & Compliance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-sky-900/50 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full" style={{width: '30%'}}></div>
                    </div>
                    <span className="text-sky-200 text-sm w-40">30% — Net Profit Pool</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-sky-900/50 rounded-full h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-sky-400 to-blue-400 h-full rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <span className="text-sky-200 text-sm w-40">25% — Investor Earnings</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-200 text-sm">
                    <strong className="text-amber-300">Referral Bonus:</strong> Earn a <strong>5% once-off commission</strong> on every successful investor referral.
                  </p>
                </div>
              </div>

              {/* Risk & Terms */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Risk & Withdrawal Terms</h3>
                </div>
                <ul className="space-y-3">
                  {[
                    { icon: '🛡️', text: 'Managed default rate of only 4–5% monthly' },
                    { icon: '🔄', text: 'Dedicated debt recovery up to 12 months' },
                    { icon: '📊', text: 'Diversified lending across multiple clients' },
                    { icon: '💸', text: 'Annual profit withdrawals with 30-day notice' },
                    { icon: '📅', text: 'Flexible fixed-cycle cash flow strategy' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sky-100">
                      <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                      <span className="text-sm">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Investment Tiers Table */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white">Investment Tiers — Annualised Returns</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-sky-300 font-semibold text-sm uppercase tracking-wider">Investment Amount</th>
                    <th className="text-center py-4 px-6 text-sky-300 font-semibold text-sm uppercase tracking-wider">Estimated Annual Return</th>
                    <th className="text-right py-4 px-6 text-sky-300 font-semibold text-sm uppercase tracking-wider">Return %</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { range: 'R100K – R500K', label: 'Starter', color: 'bg-sky-500/20 text-sky-300', pct: '25%', bar: '25' },
                    { range: 'R600K – R1M', label: 'Growth', color: 'bg-blue-500/20 text-blue-300', pct: '30%', bar: '30' },
                    { range: 'R1.5M – R2.5M', label: 'Premium', color: 'bg-emerald-500/20 text-emerald-300', pct: '35%', bar: '35' },
                    { range: 'R3M – R4M', label: 'Elite', color: 'bg-amber-500/20 text-amber-300', pct: '40%', bar: '40' },
                    { range: 'R4.5M – R5.5M', label: 'Platinum', color: 'bg-purple-500/20 text-purple-300', pct: '45%', bar: '45' },
                    { range: 'R6M+', label: 'Diamond', color: 'bg-rose-500/20 text-rose-300', pct: '50%', bar: '50' },
                  ].map((tier, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${tier.color}`}>{tier.label}</span>
                          <span className="text-white font-semibold">{tier.range}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-400 transition-all duration-500"
                              style={{ width: `${tier.bar}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-300">{tier.pct}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-sky-600/30 to-blue-600/30 border border-sky-500/30 rounded-3xl p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Invest?</h3>
            <p className="text-sky-100/80 mb-8 max-w-xl mx-auto">
              Contact our investment team today to discuss a package that suits your financial goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              <a
                href="tel:+27102269149"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-full transition-colors shadow-lg"
              >
                <Phone className="w-4 h-4" />
                +27 10 226 9149
              </a>
              <a
                href="mailto:admin@deniloans.co.za"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-colors border border-white/20"
              >
                admin@deniloans.co.za
              </a>
            </div>
            <p className="text-sky-300/70 text-xs">
              Deni Loans (Pty) Ltd — Registered Credit Provider [NCRCP5749] · Member of CASA · 155 West Street, Sandton, Gauteng, 2031
            </p>
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
                {[1, 2, 3, 4].map((s) => <span key={s}>★</span>)}
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
              "The process was incredibly smooth. I was skeptical about applying online at first, but the transparency and speed of Deni Loans completely won me over."
              </p>
              <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                ZN
              </div>
              <div>
                <p className="font-bold text-gray-900">Zanele N.</p>
                <p className="text-sm text-gray-500">Durban</p>
              </div>
              </div>
            </div>
            
           
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800">
        

        {/* Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2">
              <h3 className="text-white text-2xl font-bold mb-4">Deni Loans</h3>
              <p className="mb-6 leading-relaxed text-gray-300">
                Deni Loans (Pty) Ltd is a company duly incorporated and registered under the laws of South Africa. We are committed to responsible lending practices.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="h-16 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[120px]">
                  <img src={ncrLogo} alt="NCR Registered" className="h-full object-contain" />
                </div>
                <div className="h-16 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[120px]">
                  <img src={experianLogo} alt="Experian" className="h-full object-contain" />
                </div>
                <div className="h-16 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[120px]">
                  <img src={casaLogo} alt="CASA" className="h-full object-contain" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-4">Contact Us</h4>
              <div className="space-y-3 text-sm text-gray-300">
                <p>155 West Street<br/>Sandton</p>
                <p className="text-sky-400 hover:text-sky-300 transition-colors">
                  admin@deniloans.co.za
                </p>
                <div className="flex flex-col gap-2 mt-2">
                  <p>Mon - Fri<br/>8:00 AM - 5:00 PM</p>
                  <a href="https://api.whatsapp.com/send?phone=27648778580" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300">
                    <Phone className="w-4 h-4" />
                    WhatsApp Support
                  </a>
                </div>
                
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-700">
                  <a href="https://www.instagram.com/deni_loans" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="https://www.facebook.com/profile.php?id=61584881896312&ref=PROFILE_EDIT_ig_profile_ac" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500 transition-colors">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="https://linktr.ee/Deni_Loans?fbclid=IwY2xjawQGw49leHRuA2FlbQIxMABicmlkETFvMDRjVk1nanBaNmx4V2pJc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHgKkbnZil98Wltr-_KGFX656PXVVAAxtvd93GFINWnDSUkAyos1ng2Rau8Zd_aem_XgmRzq-l2w71t6g4W-N0qw" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors">
                    <LinkIcon className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
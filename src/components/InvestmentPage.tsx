import { useNavigate } from 'react-router-dom'
import {
  TrendingUp,
  BarChart2,
  Users,
  Percent,
  RefreshCw,
  BadgeCheck,
  DollarSign,
  Shield,
  Phone,
  Instagram,
  Facebook,
  Link as LinkIcon,
} from 'lucide-react'
import ncrLogo from '../assets/NCRlogoV.png'
import experianLogo from '../assets/ExperianLogo.png'
import casaLogo from '../assets/CASALogo.jpg'

export function InvestmentPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950">
      {/* Hero */}
      <div className="relative overflow-hidden py-24 lg:py-32">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-sky-700 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-sky-500/20 text-sky-300 rounded-full text-sm font-semibold mb-6 border border-sky-500/30">
              <TrendingUp className="w-4 h-4" />
              Annual Business Venture Investment Proposal
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Grow Your Wealth
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-300 mt-2">
                With Deni Loans
              </span>
            </h1>
            <p className="text-xl text-sky-100/80 max-w-3xl mx-auto leading-relaxed">
              Empowering Financial Access, Driving Growth. Deni Loans is a fast-growing microfinance company serving over{' '}
              <strong className="text-white">10,000+</strong> clients across South Africa. Our structured 12-month
              investment model gives investors consistent monthly returns through high-velocity capital rotation.
            </p>
          </div>

          {/* Key Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-sky-300" />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">12×</p>
              <p className="text-sky-200 text-sm">Capital rotations per year</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Percent className="w-6 h-6 text-emerald-300" />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">Up to 50%</p>
              <p className="text-sky-200 text-sm">Estimated annual return</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-amber-300" />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">10,000+</p>
              <p className="text-sky-200 text-sm">Active borrower clients</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-6 h-6 text-purple-300" />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">NCR</p>
              <p className="text-sky-200 text-sm">Registered credit provider</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">1. Executive Summary</h2>
            <p className="text-sky-100/80 leading-relaxed">
              Deni Loans is a fast-growing microfinance company providing short-term lending solutions across South Africa.
              Due to increasing demand and a growing client base of over 10,000+ individuals, the company is expanding its
              lending capacity through strategic investment partnerships. This proposal outlines a structured 12-month
              investment model, allowing investors to earn consistent monthly returns over the course of a year.
            </p>
          </div>

          {/* Annual Investment Model */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">2. Annual Investment Model</h2>
            <p className="text-sky-100/80 leading-relaxed mb-3">
              Our model is built on high-velocity capital rotation. Each lending cycle runs approximately 30–40 days,
              meaning the capital can rotate <strong className="text-white">12 times per year</strong>.
            </p>
          </div>

          {/* Example Projection + Profit Sharing */}
          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* Example Projection */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-sky-300" />
                </div>
                <h3 className="text-xl font-bold text-white">3. R100,000 Annual Projection</h3>
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
                  <span className="text-sky-200">Total Capital Cycles</span>
                  <span className="text-white font-bold">12</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Total Gross Revenue (12 cycles)</span>
                  <span className="text-white font-bold">R384,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Estimated Annual Return (Before Costs)</span>
                  <span className="text-white font-bold">R484,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-sky-200">Net Profit (30% of R384,000)</span>
                  <span className="text-white font-bold">R115,200</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-sky-500/10 rounded-2xl px-4 mt-2">
                  <span className="text-sky-100 font-semibold">Your Annual Investor Share (25%)</span>
                  <span className="text-2xl font-extrabold text-sky-300">R28,800</span>
                </div>
              </div>
            </div>

            {/* Profit Sharing + Risk */}
            <div className="flex flex-col gap-6">
              {/* Profit Sharing */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">4. Costs & Profit Sharing</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-sky-900/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-slate-400 to-slate-500 h-full rounded-full"
                        style={{ width: '70%' }}
                      ></div>
                    </div>
                    <span className="text-sky-200 text-sm w-44">70% — Operations &amp; Compliance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-sky-900/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full"
                        style={{ width: '30%' }}
                      ></div>
                    </div>
                    <span className="text-sky-200 text-sm w-44">30% — Net Profit Pool</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-sky-900/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-sky-400 to-blue-400 h-full rounded-full"
                        style={{ width: '25%' }}
                      ></div>
                    </div>
                    <span className="text-sky-200 text-sm w-44">25% — Investor Earnings</span>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-amber-200 text-sm">
                    <strong className="text-amber-300">Referral Bonus:</strong> Earn a{' '}
                    <strong>5% once-off commission</strong> on every successful investor referral.
                  </p>
                </div>
              </div>

              {/* Risk & Terms */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-white">6 &amp; 7. Risk &amp; Withdrawal Terms</h3>
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
          <div className="mb-10">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">
                5. Investment Tiers — Annualised Returns
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-6 text-sky-300 font-semibold text-sm uppercase tracking-wider">
                        Investment Amount
                      </th>
                      <th className="text-center py-4 px-6 text-sky-300 font-semibold text-sm uppercase tracking-wider hidden sm:table-cell">
                        Visual Scale
                      </th>
                      <th className="text-right py-4 px-6 text-sky-300 font-semibold text-sm uppercase tracking-wider">
                        Return %
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { range: 'R100K – R500K', label: 'Starter', color: 'bg-sky-500/20 text-sky-300', pct: '25%', bar: 25 },
                      { range: 'R600K – R1M', label: 'Growth', color: 'bg-blue-500/20 text-blue-300', pct: '30%', bar: 30 },
                      { range: 'R1.5M – R2.5M', label: 'Premium', color: 'bg-emerald-500/20 text-emerald-300', pct: '35%', bar: 35 },
                      { range: 'R3M – R4M', label: 'Elite', color: 'bg-amber-500/20 text-amber-300', pct: '40%', bar: 40 },
                      { range: 'R4.5M – R5.5M', label: 'Platinum', color: 'bg-purple-500/20 text-purple-300', pct: '45%', bar: 45 },
                      { range: 'R6M+', label: 'Diamond', color: 'bg-rose-500/20 text-rose-300', pct: '50%', bar: 50 },
                    ].map((tier, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${tier.color}`}>{tier.label}</span>
                            <span className="text-white font-semibold">{tier.range}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6 hidden sm:table-cell">
                          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-400"
                              style={{ width: `${tier.bar}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-blue-300">
                            {tier.pct}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-sky-600/30 to-blue-600/30 border border-sky-500/30 rounded-3xl p-10 text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-3">8. Ready to Invest?</h2>
            <p className="text-sky-100/80 mb-8 max-w-xl mx-auto">
              Deni Loans provides a structured and scalable investment opportunity with predictable income and strong annual
              returns. Contact our investment team today to discuss a package that suits your financial goals.
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
                invest@deniloans.co.za
              </a>
              <a
                href="https://www.deniloans.co.za"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-colors border border-white/20"
              >
                www.deniloans.co.za
              </a>
            </div>
            <p className="text-sky-300/70 text-xs">
              155 West Street, Sandton, Gauteng, 2031
            </p>
          </div>

          {/* Footer strip */}
          <div className="border-t border-white/10 pt-10">
            <div className="flex flex-wrap justify-between items-center gap-6">
              <div className="flex flex-wrap gap-4">
                <div className="h-14 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[110px]">
                  <img src={ncrLogo} alt="NCR Registered" className="h-full object-contain" />
                </div>
                <div className="h-14 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[110px]">
                  <img src={experianLogo} alt="Experian" className="h-full object-contain" />
                </div>
                <div className="h-14 bg-white rounded-lg p-2 opacity-90 hover:opacity-100 transition-opacity flex items-center justify-center min-w-[110px]">
                  <img src={casaLogo} alt="CASA" className="h-full object-contain" />
                </div>
              </div>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/deni_loans" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-400 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61584881896312" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://linktr.ee/Deni_Loans" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors">
                  <LinkIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
            <p className="text-sky-300/50 text-xs text-center mt-6">
              Deni Loans (Pty) Ltd — Registered Credit Provider [NCRCP5749] · Member of the Credit Association of South Africa (CASA) · Copyright ©2025 Deni Loans (Pty) Ltd.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

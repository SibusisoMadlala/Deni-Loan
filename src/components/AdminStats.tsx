import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { adminService } from '../services/adminService'
import { LoanApplication } from '../services/loanService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import { Button } from './ui/button'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  CreditCard, 
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

export function AdminStats() {
  const { accessToken, user } = useAuth()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [accessToken])

  const loadData = async () => {
    if (!accessToken) return
    try {
      setLoading(true)
      const apps = await adminService.getAllApplications(accessToken)
      setApplications(apps)
    } catch (error) {
      console.error('Failed to load stats data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    const totalApps = applications.length
    const totalApproved = applications.filter(a => a.status === 'approved' || a.status === 'disbursed' || a.status === 'repaid').length
    const totalDeclined = applications.filter(a => a.status === 'declined').length
    const totalPending = applications.filter(a => a.status === 'pending').length
    
    // Calculate totals based on approved amounts if available, otherwise requested amounts for pending
    const totalDisbursedAmount = applications
      .filter(a => a.status === 'disbursed' || a.status === 'repaid')
      .reduce((sum, app) => sum + (app.approvedAmount || app.requestedAmount || 0), 0)
    
    const totalRequestedAmount = applications
      .reduce((sum, app) => sum + (app.requestedAmount || 0), 0)

    const avgLoanAmount = totalApps > 0 ? totalRequestedAmount / totalApps : 0
    const approvalRate = totalApps > 0 ? (totalApproved / totalApps) * 100 : 0

    return {
      totalApps,
      totalApproved,
      totalDeclined,
      totalPending,
      totalDisbursedAmount,
      totalRequestedAmount,
      avgLoanAmount,
      approvalRate
    }
  }, [applications])

  // Charts Data Preparation

  // 1. Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    applications.forEach(app => {
      const status = app.status || 'unknown'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: counts[key]
    }))
  }, [applications])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  // 2. Applications History (Last 30 Days)
  const historyData = useMemo(() => {
    const dailyCounts: Record<string, number> = {}
    
    // Sort by date first
    const sortedApps = [...applications].sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    // Group by date (YYYY-MM-DD)
    sortedApps.forEach((app: any) => {
      if (!app.createdAt) return
      try {
        const date = new Date(app.createdAt).toISOString().split('T')[0]
        dailyCounts[date] = (dailyCounts[date] || 0) + 1
      } catch (e) {}
    })

    // Take last 14 days for cleaner chart or all if few
    return Object.keys(dailyCounts).map(date => ({
      date,
      count: dailyCounts[date]
    }))
  }, [applications])

  // 3. Amount Ranges
  const amountRangeData = useMemo(() => {
    const ranges = {
      '0-1000': 0,
      '1001-2000': 0,
      '2001-3000': 0,
      '3001-4000': 0,
      '4000+': 0
    }

    applications.forEach(app => {
      const amount = app.requestedAmount || 0
      if (amount <= 1000) ranges['0-1000']++
      else if (amount <= 2000) ranges['1001-2000']++
      else if (amount <= 3000) ranges['2001-3000']++
      else if (amount <= 4000) ranges['3001-4000']++
      else ranges['4000+']++
    })

    return Object.keys(ranges).map(range => ({
      name: range,
      count: ranges[range as keyof typeof ranges]
    }))
  }, [applications])

  // 4. Top Banks
  const bankData = useMemo(() => {
    const counts: Record<string, number> = {}
    applications.forEach(app => {
      const bank = app.bankName || 'Unknown' 
      // Normalize somewhat if needed, but for now exact match
      counts[bank] = (counts[bank] || 0) + 1
    })
    
    // Sort and take top 5
    return Object.keys(counts)
      .map(key => ({ name: key, value: counts[key] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [applications])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-l-4 border-l-sky-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApps}</div>
              <p className="text-xs text-gray-500 text-muted-foreground">
                All time applications
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Disbursed Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{stats.totalDisbursedAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-500 text-muted-foreground">
                Total approved & paid out
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Avg. Loan Amount</CardTitle>
              <Activity className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{Math.round(stats.avgLoanAmount).toLocaleString()}</div>
              <p className="text-xs text-gray-500 text-muted-foreground">
                Based on requested amounts
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Approval Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvalRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 text-muted-foreground">
                Percent of approved apps
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Applications Over Time */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Application Trends</CardTitle>
              <CardDescription>Daily application volume over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12}} 
                    tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [`${value} Apps`, 'Volume']}
                  />
                  <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Distribution across all statuses</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

           {/* Loan Amount Distribution */}
           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Loan Amount Ranges</CardTitle>
              <CardDescription>Requested Amounts</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={amountRangeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

           {/* Top Banks */}
           <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Top Banks</CardTitle>
              <CardDescription>Most common applicant banks</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bankData} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Applications" barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}

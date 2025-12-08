import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { adminService } from '../services/adminService'
import { documentService, Document } from '../services/documentService'
import { LoanApplication, CreditReport } from '../services/loanService'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Bell
} from 'lucide-react'

export function AdminDashboard() {
  const { accessToken } = useAuth()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [creditReport, setCreditReport] = useState<CreditReport | null>(null)
  const [creditReportLoading, setCreditReportLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Decision modal state
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [decisionStatus, setDecisionStatus] = useState<string>('approved')
  const [approvedAmount, setApprovedAmount] = useState<number>(0)
  const [declineReason, setDeclineReason] = useState('')

  useEffect(() => {
    if (!loading && !accessToken) {
      navigate('/login')
      return
    }
    if (accessToken) {
      loadApplications()
    }
  }, [accessToken, loading])

  useEffect(() => {
    if (selectedApp?.id) {
      loadDocuments(selectedApp.id)
      loadCreditReport(selectedApp)
    }
  }, [selectedApp])

  const loadApplications = async () => {
    try {
      const apps = await adminService.getAllApplications(accessToken!)
      setApplications(apps.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
    } catch (err) {
      console.error('Failed to load applications:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async (applicationId: string) => {
    try {
      const docs = await documentService.getDocuments(applicationId, accessToken!)
      setDocuments(docs)
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }

  const loadCreditReport = async (app: LoanApplication) => {
    setCreditReportLoading(true)
    try {
      // Extract names from fullName
      const nameParts = app.fullName?.split(' ') || []
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Try to fetch credit report if we have the necessary info
      const loanService = await import('../services/loanService').then(m => m.loanService)
      const report = await loanService.performCreditCheck(
        app.idNumber!,
        app.netSalary || 0,
        0, // existingDebts - we can enhance this later
        accessToken!,
        firstName,
        lastName,
        app.dateOfBirth // This might need to be added to LoanApplication
      )
      setCreditReport(report)
    } catch (err) {
      console.error('Failed to load credit report:', err)
      setCreditReport(null)
    } finally {
      setCreditReportLoading(false)
    }
  }

  const handleVerifyDocument = async (documentId: string, verified: boolean) => {
    try {
      await adminService.verifyDocument(documentId, verified, verified ? 'Verified' : 'Rejected', accessToken!)
      await loadDocuments(selectedApp!.id!)
    } catch (err) {
      console.error('Failed to verify document:', err)
    }
  }

  const handleUpdateLoanStatus = async () => {
    if (!selectedApp?.id) return

    try {
      await adminService.updateLoanStatus(
        selectedApp.id,
        decisionStatus,
        decisionStatus === 'approved' ? approvedAmount : undefined,
        decisionStatus === 'declined' ? declineReason : undefined,
        accessToken!
      )
      setShowDecisionModal(false)
      await loadApplications()
      // Update selected app
      const updatedApp = applications.find(app => app.id === selectedApp.id)
      if (updatedApp) setSelectedApp(updatedApp)
    } catch (err) {
      console.error('Failed to update loan status:', err)
    }
  }

  const handleDisburseLoan = async () => {
    if (!selectedApp?.id) return

    try {
      await adminService.updateLoanStatus(
        selectedApp.id,
        'disbursed',
        selectedApp.approvedAmount,
        undefined,
        accessToken!
      )
      await loadApplications()
      // Update selected app view
      const updated = { ...selectedApp, status: 'disbursed' }
      setSelectedApp(updated as LoanApplication)
    } catch (err) {
      console.error('Failed to disburse loan:', err)
    }
  }

  const handleMarkAsRepaid = async () => {
    if (!selectedApp?.id) return

    try {
      await adminService.updateLoanStatus(
        selectedApp.id,
        'repaid',
        undefined,
        undefined,
        accessToken!
      )
      await loadApplications()
      // Update selected app view
      const updated = { ...selectedApp, status: 'repaid' }
      setSelectedApp(updated as LoanApplication)
      toast.success('Loan marked as repaid')
    } catch (err) {
      console.error('Failed to mark as repaid:', err)
      toast.error('Failed to mark as repaid')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: 'secondary', icon: Clock, label: 'Pending' },
      approved: { variant: 'default', icon: CheckCircle, label: 'Approved' },
      declined: { variant: 'destructive', icon: XCircle, label: 'Declined' },
      disbursed: { variant: 'default', icon: DollarSign, label: 'Disbursed' },
      repaid: { variant: 'outline', icon: CheckCircle, label: 'Repaid' }
    }
    
    const config = variants[status] || variants.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    )
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filter === 'all' || app.status === filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      (app.email?.toLowerCase().includes(searchLower)) ||
      (app.id?.toLowerCase().includes(searchLower)) ||
      (app.fullName?.toLowerCase().includes(searchLower)) ||
      (app.idNumber?.includes(searchLower))
    
    return matchesStatus && matchesSearch
  })

  // Statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    disbursed: applications.filter(app => app.status === 'disbursed').length
  }

  const handleSendReminder = async (e: React.MouseEvent, app: LoanApplication) => {
    e.stopPropagation()
    try {
      await adminService.sendPaymentReminder(app.id!, accessToken!)
      toast.success('Payment reminder sent')
    } catch (err) {
      console.error('Failed to send reminder:', err)
      toast.error('Failed to send reminder')
    }
  }

  const showNotifyButton = (app: LoanApplication) => {
    if (app.status === 'repaid') return false
    if (!app.nextPayDate) return false
    const dueDate = new Date(app.nextPayDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    return today < dueDate
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl mb-6">Admin Dashboard</h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disbursed</p>
                  <p className="text-2xl">{stats.disbursed}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Applications</h3>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="disbursed">Disbursed</SelectItem>
                    <SelectItem value="repaid">Repaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input 
                placeholder="Search by email, ID, name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredApplications.map((app: any) => (
                <Card
                  key={app.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedApp(app)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm">{app.fullName}</p>
                        <p className="text-xs text-gray-500">{app.email}</p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-lg">R{(app.requestedAmount || 0).toLocaleString()}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.nextPayDate && (
                        <p className="text-xs font-medium text-blue-600">
                          Due: {new Date(app.nextPayDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="credit report">Credit Report</TabsTrigger>
                  <TabsTrigger value="decision">Decision</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Details</CardTitle>
                      <CardDescription>ID: {selectedApp.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-600">Full Name</Label>
                          <p className="text-sm">{selectedApp.fullName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">ID Number</Label>
                          <p className="text-sm">{selectedApp.idNumber}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Phone</Label>
                          <p className="text-sm">{selectedApp.phone}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Email</Label>
                          <p className="text-sm">{selectedApp.email}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Employer</Label>
                          <p className="text-sm">{selectedApp.employerName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Next Pay Date</Label>
                          <p className="text-sm font-medium">
                            {selectedApp.nextPayDate 
                              ? new Date(selectedApp.nextPayDate).toLocaleDateString() 
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Net Salary</Label>
                          <p className="text-sm">R{selectedApp.netSalary?.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Bank</Label>
                          <p className="text-sm">{selectedApp.bankName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Account Number</Label>
                          <p className="text-sm">{selectedApp.accountNumber}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Requested Amount</Label>
                          <p className="text-sm">R{selectedApp.requestedAmount?.toLocaleString()}</p>
                        </div>
                        {selectedApp.creditScore && (
                          <div>
                            <Label className="text-xs text-gray-600">Credit Score</Label>
                            <p className="text-sm">{selectedApp.creditScore}</p>
                          </div>
                        )}
                        {selectedApp.approvedAmount && (
                          <div>
                            <Label className="text-xs text-gray-600">Approved Amount</Label>
                            <p className="text-sm text-green-600">
                              R{selectedApp.approvedAmount.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <Label className="text-xs text-gray-600">Status</Label>
                          <div className="mt-1 flex items-center gap-2">
                            {getStatusBadge(selectedApp.status!)}
                            {showNotifyButton(selectedApp) && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={(e) => handleSendReminder(e, selectedApp)}
                                className="h-6 text-xs"
                              >
                                <Bell className="w-3 h-3 mr-1" />
                                Notify
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>Document Verification</CardTitle>
                      <CardDescription>Review and verify uploaded documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {documents.length > 0 ? (
                        <div className="space-y-4">
                          {documents.map((doc) => (
                            <div
                              key={doc.id}
                              className="border rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <FileText className="w-5 h-5 text-gray-600" />
                                  <div>
                                    <p className="text-sm">{doc.fileName}</p>
                                    <p className="text-xs text-gray-500">
                                      {doc.documentType.replace('_', ' ')}
                                    </p>
                                  </div>
                                </div>
                                {doc.verified ? (
                                  <Badge variant="default">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Pending
                                  </Badge>
                                )}
                              </div>
                              
                              {doc.signedUrl && (
                                <div className="mb-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(doc.signedUrl, '_blank')}
                                  >
                                    View Document
                                  </Button>
                                </div>
                              )}

                              {!doc.verified && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerifyDocument(doc.id, true)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleVerifyDocument(doc.id, false)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-8">
                          No documents uploaded yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="decision">
                  <Card>
                    <CardHeader>
                      <CardTitle>Loan Decision</CardTitle>
                      <CardDescription>
                        Approve or decline the loan application
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedApp.status === 'pending' ? (
                        <>
                          <div className="space-y-2">
                            <Label>Decision</Label>
                            <Select value={decisionStatus} onValueChange={setDecisionStatus}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="approved">Approve</SelectItem>
                                <SelectItem value="declined">Decline</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {decisionStatus === 'approved' && (
                            <div className="space-y-2">
                              <Label>Approved Amount</Label>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">R</span>
                                <Input
                                  type="number"
                                  className="pl-8"
                                  value={approvedAmount || selectedApp.requestedAmount || 0}
                                  onChange={(e) => setApprovedAmount(parseFloat(e.target.value))}
                                  min="500"
                                  max="4000"
                                />
                              </div>
                            </div>
                          )}

                          {decisionStatus === 'declined' && (
                            <div className="space-y-2">
                              <Label>Decline Reason</Label>
                              <Textarea
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Enter reason for declining..."
                                rows={4}
                              />
                            </div>
                          )}

                          <Button
                            className="w-full"
                            onClick={handleUpdateLoanStatus}
                          >
                            Submit Decision
                          </Button>
                        </>
                      ) : selectedApp.status === 'approved' ? (
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center mb-2">
                              <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                              <h4 className="font-medium text-blue-900">Ready for Disbursement</h4>
                            </div>
                            <p className="text-sm text-blue-700 mb-4">
                              This loan is approved. Click below to mark it as disbursed.
                              This will enable payment options for the borrower.
                            </p>
                            <Button 
                              onClick={handleDisburseLoan} 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Disburse Loan
                            </Button>
                          </div>
                          <div className="text-center">
                             <p className="text-gray-600 mb-2">Current Status</p>
                             {getStatusBadge(selectedApp.status!)}
                          </div>
                        </div>
                      ) : selectedApp.status === 'disbursed' ? (
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                              <h4 className="font-medium text-blue-900">Loan Active</h4>
                            </div>
                            <p className="text-sm text-blue-700 mb-4">
                              This loan has been disbursed. When the borrower repays the loan, click below to mark it as repaid.
                            </p>
                            <Button 
                              onClick={handleMarkAsRepaid} 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              Mark as Repaid
                            </Button>
                          </div>
                          <div className="text-center">
                             <p className="text-gray-600 mb-2">Current Status</p>
                             {getStatusBadge(selectedApp.status!)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-2">
                            Decision already made
                          </p>
                          {getStatusBadge(selectedApp.status!)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="credit report">
                  <Card>
                    <CardHeader>
                      <CardTitle>Credit Report</CardTitle>
                      <CardDescription>
                        View the applicant's credit report
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {creditReportLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-gray-600">Loading credit report...</span>
                        </div>
                      ) : creditReport ? (
                        <div className="space-y-6">
                          {/* Credit Score and Risk Overview */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="border rounded-lg p-4">
                              <p className="text-xs text-gray-600 mb-1">Credit Score</p>
                              <p className="text-2xl font-bold">{creditReport.creditScore}</p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <p className="text-xs text-gray-600 mb-1">Credit Risk</p>
                              <div className="mt-1">
                                {creditReport.creditRisk && (
                                  <Badge 
                                    variant={
                                      creditReport.creditRisk === 'excellent' ? 'default' :
                                      creditReport.creditRisk === 'good' ? 'default' :
                                      creditReport.creditRisk === 'fair' ? 'secondary' :
                                      'destructive'
                                    }
                                  >
                                    {creditReport.creditRisk.charAt(0).toUpperCase() + creditReport.creditRisk.slice(1)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="border rounded-lg p-4">
                              <p className="text-xs text-gray-600 mb-1">Disposable Income</p>
                              <p className="text-xl font-semibold text-green-600">
                                R{creditReport.disposableIncome?.toLocaleString() || '0'}
                              </p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <p className="text-xs text-gray-600 mb-1">Max Loan Amount</p>
                              <p className="text-xl font-semibold text-blue-600">
                                R{creditReport.maxLoanAmount?.toLocaleString() || '0'}
                              </p>
                            </div>
                          </div>

                          {/* Approval Status */}
                          <div className="border-l-4 rounded-lg p-4" style={{
                            borderLeftColor: creditReport.approved ? '#10b981' : '#ef4444'
                          }}>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">
                                  {creditReport.approved ? 'Credit Check Passed' : 'Credit Check Failed'}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">{creditReport.reason}</p>
                              </div>
                              {creditReport.approved ? (
                                <CheckCircle className="w-8 h-8 text-green-600" />
                              ) : (
                                <XCircle className="w-8 h-8 text-red-600" />
                              )}
                            </div>
                          </div>

                          {/* Credit Profile Details */}
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-4">Credit Profile Details</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {creditReport.numberOfAccounts !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600">Number of Accounts</p>
                                  <p className="text-lg font-semibold">{creditReport.numberOfAccounts}</p>
                                </div>
                              )}
                              {creditReport.defaultedAccounts !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600">Defaulted Accounts</p>
                                  <p className="text-lg font-semibold text-orange-600">{creditReport.defaultedAccounts}</p>
                                </div>
                              )}
                              {creditReport.judgments !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600">Judgments</p>
                                  <p className="text-lg font-semibold text-red-600">{creditReport.judgments}</p>
                                </div>
                              )}
                              {creditReport.administrationOrders !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600">Administration Orders</p>
                                  <p className="text-lg font-semibold text-red-600">{creditReport.administrationOrders}</p>
                                </div>
                              )}
                              {creditReport.existingObligations !== undefined && (
                                <div>
                                  <p className="text-xs text-gray-600">Existing Obligations</p>
                                  <p className="text-lg font-semibold">R{creditReport.existingObligations.toLocaleString()}</p>
                                </div>
                              )}
                              {creditReport.source && (
                                <div>
                                  <p className="text-xs text-gray-600">Data Source</p>
                                  <Badge variant="outline">
                                    {creditReport.source === 'experian' ? 'Experian' : 'Mock'}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Check Timestamp */}
                          {creditReport.checkedAt && (
                            <div className="text-xs text-gray-500 text-right">
                              Credit check performed: {new Date(creditReport.checkedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">
                            No credit report available
                          </p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => selectedApp && loadCreditReport(selectedApp)}
                          >
                            Retry Loading Credit Report
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent> 
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Select an application to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
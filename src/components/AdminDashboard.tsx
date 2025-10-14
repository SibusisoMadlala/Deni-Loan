import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { adminService } from '../services/adminService'
import { documentService, Document } from '../services/documentService'
import { LoanApplication } from '../services/loanService'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export function AdminDashboard() {
  const { accessToken } = useAuth()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

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
    if (filter === 'all') return true
    return app.status === filter
  })

  // Statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    disbursed: applications.filter(app => app.status === 'disbursed').length
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
                </SelectContent>
              </Select>
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
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(app.createdAt).toLocaleString()}
                    </p>
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
                          <div className="mt-1">{getStatusBadge(selectedApp.status!)}</div>
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
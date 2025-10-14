import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loanService, LoanApplication } from '../services/loanService'
import { documentService, Document } from '../services/documentService'
import { PaymentButton } from './paymentButton'// Add this import
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { 
  CreditCard, 
  FileText, 
  Download, 
  Plus, 
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  MessageCircle
} from 'lucide-react'

export function BorrowerDashboard() {
  const navigate = useNavigate()
  const { user, accessToken } = useAuth()
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null) // Add payment error state

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
    if (selectedApplication) {
      loadDocuments(selectedApplication)
    }
  }, [selectedApplication])

  const loadApplications = async () => {
    try {
      console.log(accessToken)
      
      const apps = await loanService.getMyApplications(accessToken!)
      setApplications(apps.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
      if (apps.length > 0 && !selectedApplication) {
        setSelectedApplication(apps[0].id)
      }
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

  // Calculate repayment amounts
  const calculateRepaymentAmounts = (application: any) => {
    const approvedAmount = application.approvedAmount || application.requestedAmount || 0;
    
    // Simple calculation: 3 monthly installments with 10% interest
    const totalWithInterest = approvedAmount * 1.1;
    const monthlyInstallment = Math.ceil(totalWithInterest);
    const fullSettlement = Math.ceil(approvedAmount * 1.05); // 5% early settlement discount
    
    return {
      monthlyInstallment,
      fullSettlement,
      totalWithInterest
    };
  };

  const currentApp = applications.find(app => app.id === selectedApplication)
  const repaymentAmounts = currentApp ? calculateRepaymentAmounts(currentApp) : null;

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl mb-2">Welcome back, {user?.fullName}</h1>
            <p className="text-gray-600">Manage your loans and documents</p>
          </div>
          <Button onClick={() => navigate('/apply')}>
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No Applications Yet</h3>
              <p className="text-gray-600 mb-6">
                Start your first loan application to get quick access to funds
              </p>
              <Button onClick={() => navigate('/apply')}>
                Apply for a Loan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="space-y-4">
              <h3 className="text-lg">Your Applications</h3>
              {applications.map((app: any) => (
                <Card
                  key={app.id}
                  className={`cursor-pointer transition-all ${
                    selectedApplication === app.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedApplication(app.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-2xl">
                      R{(app.approvedAmount || app.requestedAmount || 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      ID: {app.id?.substring(0, 8)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Application Details */}
            <div className="lg:col-span-2">
              {currentApp && (
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="details">Loan Details</TabsTrigger>
                    <TabsTrigger value="repayments">Repayments</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details">
                    <Card>
                      <CardHeader>
                        <CardTitle>Loan Details</CardTitle>
                        <CardDescription>
                          Application ID: {currentApp.id}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Status</p>
                            <div className="mt-1">{getStatusBadge(currentApp.status!)}</div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Requested Amount</p>
                            <p className="text-lg">R{(currentApp.requestedAmount || 0).toLocaleString()}</p>
                          </div>
                          {currentApp.approvedAmount && (
                            <div>
                              <p className="text-sm text-gray-600">Approved Amount</p>
                              <p className="text-lg text-green-600">
                                R{currentApp.approvedAmount.toLocaleString()}
                              </p>
                            </div>
                          )}
                          {currentApp.creditScore && (
                            <div>
                              <p className="text-sm text-gray-600">Credit Score</p>
                              <p className="text-lg">{currentApp.creditScore}</p>
                            </div>
                          )}
                        </div>

                        {currentApp.status === 'declined' && currentApp.declineReason && (
                          <Alert variant="destructive">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Decline Reason:</strong> {currentApp.declineReason}
                            </AlertDescription>
                          </Alert>
                        )}

                        {currentApp.status === 'approved' && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Your loan has been approved! Funds will be disbursed within 24 hours.
                            </AlertDescription>
                          </Alert>
                        )}

                        {currentApp.status === 'disbursed' && (
                          <Alert>
                            <DollarSign className="h-4 w-4" />
                            <AlertDescription>
                              Funds have been paid to your account. Check the Repayments tab for payment details.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="repayments">
                    <Card>
                      <CardHeader>
                        <CardTitle>Repayments</CardTitle>
                        <CardDescription>
                          Manage your loan repayments
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentApp.status === 'disbursed' ? (
                          <div className="space-y-4">
                            {/* Payment Error Alert */}
                            {paymentError && (
                              <Alert variant="destructive">
                                <XCircle className="h-4 w-4" />
                                <AlertDescription>
                                  {paymentError}
                                </AlertDescription>
                              </Alert>
                            )}

                            {/* Monthly Installment Payment */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <div>
                                  <p className="font-semibold text-blue-900">Month End Settlement</p>
                                  <p className="text-sm text-blue-700">
                                    Pay your next installment of R{repaymentAmounts?.monthlyInstallment.toLocaleString()}
                                  </p>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">
                                  R{repaymentAmounts?.monthlyInstallment.toLocaleString()}
                                </p>
                              </div>
                              <PaymentButton
                                applicationId={currentApp.id}
                                amount={repaymentAmounts?.monthlyInstallment || 0}
                                paymentType="first_repayment"
                                onError={(error) => setPaymentError(error)}
                              />
                            </div>

                            {/* Full Settlement Payment */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <div>
                                  <p className="font-semibold text-green-900">Early Settlement</p>
                                  <p className="text-sm text-green-700">
                                    Pay off your entire loan early and save on interest
                                  </p>
                                  <p className="text-xs text-green-600 mt-1">
                                    5% early settlement discount applied
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-900">
                                    R{repaymentAmounts?.fullSettlement.toLocaleString()}
                                  </p>
                                  <p className="text-sm text-green-600 line-through">
                                    R{repaymentAmounts?.totalWithInterest.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <PaymentButton
                                applicationId={currentApp.id}
                                amount={repaymentAmounts?.fullSettlement || 0}
                                paymentType="full_settlement"
                                onError={(error) => setPaymentError(error)}
                              />
                            </div>

                            {/* Loan Summary */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold mb-2">Loan Summary</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Approved Amount:</span>
                                  <span>R{(currentApp.approvedAmount || currentApp.requestedAmount || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Total with Interest:</span>
                                  <span>R{repaymentAmounts?.totalWithInterest.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Monthly Installments:</span>
                                  <span>3 months</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Early Settlement:</span>
                                  <span className="text-green-600">Save R{(repaymentAmounts?.totalWithInterest - (repaymentAmounts?.fullSettlement || 0)).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : currentApp.status === 'approved' ? (
                          <div className="space-y-4">
                            {/* Application Fee Payment for Approved Loans */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <div>
                                  <p className="font-semibold text-orange-900">Application Fee</p>
                                  <p className="text-sm text-orange-700">
                                    Pay the application fee to proceed with loan disbursement
                                  </p>
                                </div>
                                <p className="text-2xl font-bold text-orange-900">R50</p>
                              </div>
                              <PaymentButton
                                applicationId={currentApp.id}
                                amount={50}
                                paymentType="application_fee"
                                onError={(error) => setPaymentError(error)}
                              />
                            </div>
                            <p className="text-gray-600 text-center py-4">
                              Once the application fee is paid, your funds will be disbursed within 24 hours.
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-600 text-center py-8">
                            Repayment information will be available once your loan is approved and disbursed.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents">
                    <Card>
                      <CardHeader>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>
                          View and download your loan documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {documents.length > 0 ? (
                          <div className="space-y-3">
                            {documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <FileText className="w-5 h-5 text-gray-600" />
                                  <div>
                                    <p className="text-sm">{doc.fileName}</p>
                                    <p className="text-xs text-gray-500">
                                      {doc.documentType.replace('_', ' ')}
                                    </p>
                                  </div>
                                </div>
                                {doc.signedUrl && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(doc.signedUrl, '_blank')}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
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
                </Tabs>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-1">Need Help?</h3>
                <p className="text-sm text-gray-600">
                  Contact our support team via WhatsApp
                </p>
              </div>
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
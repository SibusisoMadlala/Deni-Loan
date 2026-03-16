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
import { calculateLoan } from '../utils/loanCalculator'
import { 
  CreditCard, 
  FileText, 
  Download, 
  Plus, 
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  MessageCircle,
  AlertCircle
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
      repaid: { variant: 'outline', icon: CheckCircle, label: 'Repaid' },
      counter_offer: { variant: 'warning', icon: AlertCircle, label: 'Counter Offer' }
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
    
    let totalWithInterest = 0;
    
    if (application.totalDue) {
      totalWithInterest = application.totalDue;
    } else {
      // Fallback for applications without stored totals
      const { totalRepayable } = calculateLoan(approvedAmount, 1, true);
      totalWithInterest = totalRepayable;
    }

    const monthlyInstallment = totalWithInterest; // Assuming 1 month term
    const fullSettlement = totalWithInterest; 
    
    return {
      monthlyInstallment,
      fullSettlement,
      totalWithInterest
    };
  };

  // Check if user has active approved/disbursed loan
  const checkForEligibility = () => {
    if (applications.length === 0) return { canApply: true };

    // Get latest application (already sorted by date desc in loadApplications)
    const lastApp = applications[0];

    // Rule A: Active Loan Check
    // Disbursed always blocks, pending/reviewing blocks, approved only blocks within 30 days
    if (lastApp.status === 'disbursed') {
      return { 
        canApply: false, 
        reason: 'You have an active disbursed loan. Please settle your current loan before applying for a new one.' 
      };
    }
    
    if (lastApp.status === 'pending' || lastApp.status === 'reviewing' || lastApp.status === 'review') {
      return { 
        canApply: false, 
        reason: 'You have an application being reviewed. Please wait for a decision.' 
      };
    }
    
    // Approved loans only block for 30 days - after that they're considered stale
    if (lastApp.status === 'approved') {
      const approvedDate = new Date(lastApp.updatedAt || lastApp.createdAt!);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - approvedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return { 
          canApply: false, 
          reason: 'You have an approved loan. Please wait for disbursement or contact support.' 
        };
      }
      // Approved more than 30 days ago - allow new application
    }

    // Rule B: 30-Day Cooling Off (if declined)
    if (lastApp.status === 'declined') {
      const decidedDate = new Date(lastApp.updatedAt || lastApp.createdAt!);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - decidedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return { 
          canApply: false, 
          reason: `Cooling off period active. You can apply again in ${30 - diffDays} days.` 
        };
      }
    }

    // Rule C: 30-Day Cooling Off (if repaid) - DISABLED
    // Find the most recent repaid loan
    /*
    const repaidLoans = applications
      .filter((app: any) => app.status === 'repaid' && app.updatedAt)
      .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (repaidLoans.length > 0) {
      const lastRepaid = repaidLoans[0];
      const repaidDate = new Date(lastRepaid.updatedAt);
      const today = new Date();
      // Calculate days passed since repayment
      const diffTime = today.getTime() - repaidDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        return { 
          canApply: false, 
          reason: `Cooling off period active. You can apply again in ${30 - diffDays} days.` 
        };
      }
    }
    */

    return { canApply: true };
  };

  const { canApply, reason: restrictionReason } = checkForEligibility();

  const handleRespondToCounterOffer = async (accepted: boolean) => {
    try {
      if (!selectedApplication) return;
      await loanService.respondToCounterOffer(selectedApplication, accepted, accessToken!);
      await loadApplications();
    } catch (err) {
      console.error('Failed to respond to counter offer:', err);
    }
  }

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
          <div className="flex flex-col gap-2">
            <div>
              <h1 className="text-3xl mb-2">Welcome back, {user?.fullName}</h1>
              <p className="text-gray-600">Manage your loans and documents.</p>
            </div>
            <a 
              href="https://api.whatsapp.com/send?phone=27648778580" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors w-fit border border-emerald-200"
            >
              <MessageCircle className="w-5 h-5" />
              Need Help? Chat on WhatsApp
            </a>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button 
              onClick={() => navigate('/apply')}
              disabled={!canApply}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Application
            </Button>
            {!canApply && (
              <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 max-w-[250px] text-right shadow-sm">
                <Clock className="w-3 h-3 inline-block mr-1" />
                {restrictionReason}
              </span>
            )}
          </div>
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
          <>
            {!canApply && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Notice:</strong> {restrictionReason}
                </AlertDescription>
              </Alert>
            )}
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
                          
                          {(currentApp.status === 'counter_offer') && (
                            <div className="col-span-2 mt-4 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                              <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Counter Offer Received
                              </h3>
                              <p className="text-sm text-yellow-700 mb-4">
                                We reviewed your application and can offer you a loan of:
                                <span className="block text-2xl font-bold mt-1">
                                  R{(currentApp.counterOfferAmount || 0).toLocaleString()}
                                </span>
                              </p>
                              <div className="flex gap-4">
                                <Button 
                                  onClick={() => handleRespondToCounterOffer(true)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Accept Offer
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleRespondToCounterOffer(false)}
                                >
                                  Decline Offer
                                </Button>
                              </div>
                            </div>
                          )}

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

                        {currentApp.status === 'pending' && (
                          <Alert>
                            <Clock className="h-4 w-4" />
                            <AlertDescription>
                              Your application has been submitted successfully! Our admin team is reviewing your application. 
                              You will be notified within 24-48 hours once a decision has been made.
                            </AlertDescription>
                          </Alert>
                        )}

                        {currentApp.status === 'approved' && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Your loan has been approved! Please proceed to the Repayments tab to pay the application fee and your funds will be disbursed within 24 hours.
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

                            {/* Payment Options - Early Repayment Only */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-3">
                                <div>
                                  <p className="font-semibold text-green-900">Early Repayment</p>
                                  <p className="text-sm text-green-700">
                                    Pay off your loan early
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-green-900">
                                    R{repaymentAmounts?.fullSettlement.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              <Button 
                                className="w-full bg-blue-50 hover:bg-blue-100 text-black h-16 text-lg font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                                onClick={() => {
                                  const amount = repaymentAmounts?.fullSettlement || 0;
                                  const orderId = currentApp.idNumber.toString() || '123456789';
                                  const customer = currentApp.fullName || user?.fullName || 'Customer';
                                  // Redirect to external payment page
                                  // Mapping: amount -> amount, orderId -> orderId, customer -> customer
                                  const url = `https://website-afa19dec.jdn.ixm.mybluehost.me/omnipay-ozow/payment.php?amount=${amount}&orderId=${orderId}&customer=${encodeURIComponent(customer)}`;
                                  window.location.href = url;
                                }}
                              >
                                <CreditCard className="w-6 h-6 mr-2" />
                                Pay Early Repayment - R{repaymentAmounts?.fullSettlement.toLocaleString()}
                              </Button>
                            </div>


                          </div>
                        ) : currentApp.status === 'approved' ? (
                          <div className="text-center py-8">
                            <Clock className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">Loan Approved</h3>
                            <p className="text-gray-600 mt-2">
                              Your loan has been approved and is being processed for disbursement.
                              Payment options will appear here once the funds have been disbursed.
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
            </>
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
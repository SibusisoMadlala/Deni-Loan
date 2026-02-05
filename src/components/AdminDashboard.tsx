import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { adminService } from '../services/adminService'
import { documentService, Document } from '../services/documentService'
import { LoanApplication, CreditReport } from '../services/loanService'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea, ScrollBar } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { toast } from 'sonner'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock, 
  FileText, 
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  TrendingDown,
  Bell,
  Shield,
  Pencil
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
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Decision modal state
  const [showDecisionModal, setShowDecisionModal] = useState(false)
  const [decisionStatus, setDecisionStatus] = useState<string>('approved')
  const [approvedAmount, setApprovedAmount] = useState<number>(0)
  const [declineReason, setDeclineReason] = useState('')

  // Identity verification state
  const [verifyingIdentity, setVerifyingIdentity] = useState(false)
  const [showVerificationDetails, setShowVerificationDetails] = useState(false)
  const [isEditingId, setIsEditingId] = useState(false)
  const [tempIdNumber, setTempIdNumber] = useState('')

  // Credit Score state
  const [checkingCreditScore, setCheckingCreditScore] = useState(false)
  const [showCreditScoreDetails, setShowCreditScoreDetails] = useState(false)

  // Financial Snapshot state
  const [gettingFinancialSnapshot, setGettingFinancialSnapshot] = useState(false)
  const [showFinancialSnapshotDetails, setShowFinancialSnapshotDetails] = useState(false)

  // Account Verification state
  const [verifyingAccount, setVerifyingAccount] = useState(false)

  const parseCreditScoreResult = (xml: string) => {
    if (!xml) return [];
    console.log("Raw XML to parse:", xml);
    try {
      const parser = new DOMParser();
      let xmlDoc = parser.parseFromString(xml, "text/xml");
      
      const errorCodes: {[key: string]: string} = {
        '-101': 'Not all variables filled in.',
        '-105': 'Input version not supported',
        '-106': 'Something went wrong while your transaction was executing.',
        '-107': 'Invalid user details supplied or user inactive.',
        '-108': 'Result type not supported.',
        '-110': 'Your branch is not switched on for this service.',
        '-113': 'Id Number not supplied',
        '-114': 'Invalid Id number supplied.',
        '-115': 'Thin file - No data available for the Id number supplied.',
        '-116': 'Your branch is not switched on for any CompuScore version.',
        '-999': 'Unknown Error.'
      };

      // Check for TransactionReplyClass (Experian format)
      const transactionReply = xmlDoc.getElementsByTagName('TransactionReplyClass')[0];
      if (transactionReply) {
        const errorCode = transactionReply.getElementsByTagName('errorCode')[0]?.textContent;
        const errorDescription = transactionReply.getElementsByTagName('errorDescription')[0]?.textContent;
        
        if (errorCode && errorCode.trim() !== '') {
           return [{ error: errorDescription || errorCodes[errorCode] || 'Unknown Error', code: errorCode }];
        }

        // Parse returnData JSON
        const returnData = transactionReply.getElementsByTagName('returnData')[0]?.textContent;
        if (returnData) {
          try {
            const parsedData = JSON.parse(returnData);
            if (parsedData.results && Array.isArray(parsedData.results)) {
              return parsedData.results.map((res: any) => ({
                resultType: res.resultType,
                score: res.score,
                reasons: (res.reasons || [])
                  .filter((r: any) => r.reasonCode && r.reasonDescription)
                  .map((r: any) => ({
                    code: r.reasonCode,
                    description: r.reasonDescription
                  }))
              }));
            }
          } catch (e) {
            console.error("Failed to parse returnData JSON", e);
          }
        }
      }

      // Check if it's a SOAP envelope and extract the return value
      const returnNode = xmlDoc.getElementsByTagName('return')[0];
      if (returnNode && returnNode.textContent) {
        const content = returnNode.textContent.trim();
        console.log("Return node content:", content);

        // Check if the content itself is an error code
        if (errorCodes[content]) {
          return [{ error: errorCodes[content], code: content }];
        }

        // If it looks like XML, parse it
        if (content.startsWith('<')) {
          xmlDoc = parser.parseFromString(content, "text/xml");
        }
      }

      // Check for error codes in the root text content if no results found (fallback)
      const rootText = xmlDoc.documentElement?.textContent?.trim();
      if (rootText && errorCodes[rootText]) {
        return [{ error: errorCodes[rootText], code: rootText }];
      }

      const results = Array.from(xmlDoc.getElementsByTagName('result')).map(result => {
        const resultType = result.getElementsByTagName('resultType')[0]?.textContent;
        const score = result.getElementsByTagName('score')[0]?.textContent?.trim();

        if (score && errorCodes[score]) {
          return { error: errorCodes[score], code: score };
        }

        const reasons = Array.from(result.getElementsByTagName('reason')).map(reason => ({
          code: reason.getElementsByTagName('reasonCode')[0]?.textContent,
          description: reason.getElementsByTagName('reasonDescription')[0]?.textContent
        }));
        
        return { resultType, score, reasons };
      });

      console.log("Parsed results:", results);
      return results;
    } catch (e) {
      console.error("Error parsing Credit Score XML", e);
      return [];
    }
  };

  const handleGetCreditScore = async () => {
    if (!selectedApp?.idNumber || !selectedApp?.id) return
    
    setCheckingCreditScore(true)
    
    try {
      const result = await adminService.getCreditScore(selectedApp.id, selectedApp.idNumber, accessToken!)
      
      const updatedApp = {
        ...selectedApp,
        creditScoreCheck: {
          checkedAt: new Date().toISOString(),
          rawData: result.data,
          status: result.status
        }
      };
      
      setSelectedApp(updatedApp);
      setApplications(apps => apps.map(a => a.id === updatedApp.id ? updatedApp : a));
      
      toast.success('Credit score check completed')
    } catch (err) {
      console.error('Failed to get credit score:', err)
      toast.error('Failed to get credit score')
    } finally {
      setCheckingCreditScore(false)
    }
  }

  const handleVerifyAccount = async () => {
    if (!selectedApp?.id) return
    
    setVerifyingAccount(true)
    
    try {
      const result = await adminService.verifyAccount(selectedApp.id, accessToken!)
      
      const updatedApp = {
        ...selectedApp,
        accountVerification: {
          checkedAt: new Date().toISOString(),
          rawData: result.data,
          status: result.status
        }
      };
      
      setSelectedApp(updatedApp);
      setApplications(apps => apps.map(a => a.id === updatedApp.id ? updatedApp : a));
      
      toast.success('Account verification completed')
    } catch (err) {
      console.error('Failed to verify account:', err)
      toast.error('Failed to verify account')
    } finally {
      setVerifyingAccount(false)
    }
  }

  const parseAccountVerificationResult = (xml: string) => {
    if (!xml) return null;
    try {
       const parser = new DOMParser();
       const xmlDoc = parser.parseFromString(xml, "text/xml");

       // Helper to safely get text content
       const getVal = (tag: string) => {
          const els = xmlDoc.getElementsByTagName(tag);
          return els.length > 0 ? els[0].textContent : null;
       }

       // Look for Result Code/Message
       // Typically in AVS: <Result><code>00</code><message>Match</message></Result>
       // Or under <Response>
       
       // Just returning structure to be displayed
       const result = {
         result: getVal('Result') || getVal('ResponseStatus') || 'N/A',
         resultCode: getVal('ResultCode') || getVal('ResponseCode') || 'N/A',
         accountFound: getVal('AccountFound') || 'N/A',
         idMatch: getVal('IDNumberMatch') || getVal('IdMatch') || 'N/A',
         surnameMatch: getVal('SurnameMatch') || 'N/A',
         initialsMatch: getVal('InitialsMatch') || 'N/A',
         accountOpen: getVal('AccountOpen') || 'N/A',
         accountAcceptsCredits: getVal('AccountAcceptsCredits') || 'N/A',
         accountAcceptsDebits: getVal('AccountAcceptsDebits') || 'N/A',
         accountOpen90Days: getVal('AccountOpen90Days') || 'N/A'
       };
       return result;
    } catch (e) {
      console.error("Error parsing AVS XML", e);
      return null;
    }
  };

  const handleGetFinancialSnapshot = async () => {
    if (!selectedApp?.idNumber || !selectedApp?.id) return
    
    setGettingFinancialSnapshot(true)
    
    try {
      const result = await adminService.getFinancialSnapshot(selectedApp.id, selectedApp.idNumber, accessToken!)
      
      const updatedApp = {
        ...selectedApp,
        financialSnapshot: {
          checkedAt: new Date().toISOString(),
          rawData: result.data,
          status: result.status
        }
      };
      
      setSelectedApp(updatedApp);
      setApplications(apps => apps.map(a => a.id === updatedApp.id ? updatedApp : a));
      
      toast.success('Financial snapshot retrieved')
    } catch (err) {
      console.error('Failed to get financial snapshot:', err)
      toast.error('Failed to get financial snapshot')
    } finally {
      setGettingFinancialSnapshot(false)
    }
  }

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
      // Initialize approved amount with current value or requested value
      setApprovedAmount(selectedApp.approvedAmount || selectedApp.requestedAmount || 0)
    }
  }, [selectedApp])

  useEffect(() => {
    if (selectedApp) {
      setTempIdNumber(selectedApp.idNumber)
    }
  }, [selectedApp?.idNumber])

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
    // Check if we already have a persisted report
    if (app.creditReport) {
      setCreditReport(app.creditReport)
      return
    }

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
        app.dateOfBirth,
        app.id // Pass application ID to enable server-side persistence
      )
      setCreditReport(report)
      
      // Update local state to reflect the persisted report
      setApplications(prev => prev.map(a => 
        a.id === app.id ? { ...a, creditReport: report } : a
      ))
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

  const parseVerificationResult = (xml: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");
      
      const getText = (tag: string) => {
        // Try direct tag name first
        let el = xmlDoc.getElementsByTagName(tag)[0];
        if (el) return el.textContent;
        
        // Try with namespaces (iterate all elements)
        const allElements = xmlDoc.getElementsByTagName("*");
        for (let i = 0; i < allElements.length; i++) {
          if (allElements[i].localName === tag || allElements[i].localName === tag.toLowerCase()) {
            return allElements[i].textContent;
          }
        }
        return 'N/A';
      };

      return {
        result: getText('ResponseStatus') || getText('Result'),
        idNumber: getText('IdentityNumber'),
        names: getText('Name') || getText('Names'),
        surname: getText('Surname'),
        deceasedStatus: getText('Deceased') || getText('DeceasedStatus'),
        maritalStatus: getText('MaritalStatus'),
        smartCardIssued: getText('SmartCardIssued'),
        onHANIS: getText('OnHANIS'),
        onNPR: getText('OnNPR')
      };
    } catch (e) {
      console.error("Error parsing XML", e);
      return null;
    }
  };

  const handleVerifyIdentity = async () => {
    if (!selectedApp?.idNumber || !selectedApp?.id) return
    
    setVerifyingIdentity(true)
    
    try {
      const result = await adminService.verifyIdentity(selectedApp.id, selectedApp.idNumber, accessToken!)
      
      const updatedApp = {
        ...selectedApp,
        identityVerification: {
          verifiedAt: new Date().toISOString(),
          rawData: result.data,
          status: result.status
        }
      };
      
      setSelectedApp(updatedApp);
      setApplications(apps => apps.map(a => a.id === updatedApp.id ? updatedApp : a));
      
      toast.success('Identity verification completed')
    } catch (err) {
      console.error('Failed to verify identity:', err)
      toast.error('Failed to verify identity')
    } finally {
      setVerifyingIdentity(false)
    }
  }

  const parsePersonSearchResult = (jsonData: any) => {
  if (!jsonData) return null;
  
  try {
    // If jsonData is a string (which it should be from the API), parse it
    let parsedData = jsonData;
    if (typeof jsonData === 'string') {
      try {
        parsedData = JSON.parse(jsonData);
      } catch (e) {
        console.error("Failed to parse JSON string in parsePersonSearchResult", e);
        // If it's not JSON, maybe it's the old XML or something else, but we can't parse it as JSON
        return null; 
      }
    }

    // Handle direct response from backend structure
    const data = parsedData.data || parsedData;
    
    // Check for error response
    if (data.response_status === "Failure") {
      console.error("Experian API Error:", data.error_description);
      return null;
    }

    // Extract data from REST JSON structure (pages 20-21 in documentation)
    const returnData = data.return_data || {};
    const searchResult = returnData.search_result || {};
    const datasetCnt = returnData.dataset_cnt || {};
    const nmCnt = datasetCnt.nm_cnt || {};
    const wlsCnt = datasetCnt.wls_cnt || {};
    const pepCnt = datasetCnt.pep_cnt || {};

    const result = {
      transactionId: returnData.transaction_id || '',
      enquiryDate: returnData.enquiry_date_time || '',
      person: {
        idNumber: searchResult.identity_number || '',
        firstName: searchResult.first_name || '',
        surname: searchResult.surname || '',
        gender: searchResult.gender || '',
      },
      counts: {
        negativeMedia: {
          all: nmCnt.all_nmcat_cnt || nmCnt.all || '0',
          crime: nmCnt.crime_and_courts_cnt || '0',
          fraud: nmCnt.business_and_financial_cnt || '0',
          corruption: nmCnt.corruption_cnt || '0',
        },
        watchlist: {
          all: wlsCnt.all_wlscat_cnt || wlsCnt.all || '0',
          criminal: wlsCnt.national_criminal_file_cnt || '0',
          global: wlsCnt.global_criminal_cnt || '0',
          terrorism: wlsCnt.terrorism_cnt || '0',
          sexOffender: wlsCnt.sex_offenders_cnt || '0',
        },
        peps: {
          family: pepCnt.family_members_cnt || '0',
          business: pepCnt.business_relations_cnt || '0',
          social: pepCnt.social_cnt || '0',
        }
      }
    };
    
    return result;
  } catch (e) {
    console.error("Failed to parse Person Search JSON", e, jsonData);
    return null;
  }
};

  const parseCreditReportXML = (xmlString: string) => {
    try {
      if (!xmlString) return null;
      
      // If it's already JSON (mocks), return it directly
      if (xmlString.trim().startsWith('{')) {
          return JSON.parse(xmlString);
      }

      // Extract JSON from XML returnData tag
      // <returnData>{...}</returnData>
      const match = xmlString.match(/<returnData>(.*?)<\/returnData>/);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
      return null;
    } catch (e) {
      console.error("Failed to parse credit report XML", e);
      return null;
    }
  };

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

  const isToday = (dateString: string) => {
    const today = new Date()
    const date = new Date(dateString)
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const isThisWeek = (dateString: string) => {
    const today = new Date()
    const date = new Date(dateString)
    const diff = today.getTime() - date.getTime()
    const days = diff / (1000 * 3600 * 24)
    return days <= 7
  }

  const isThisMonth = (dateString: string) => {
    const today = new Date()
    const date = new Date(dateString)
    return date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const filteredApplications = applications
    .map((app, index) => ({...app, originalIndex: index + 1}))
    .filter(app => {
    // Status Filter
    const matchesStatus = filter === 'all' || app.status === filter
    
    // Search Filter
    const searchLower = searchQuery.toLowerCase().replace('#', '')
    const matchesSearch = 
      (app.email?.toLowerCase().includes(searchLower)) ||
      (app.id?.toLowerCase().includes(searchLower)) ||
      (app.fullName?.toLowerCase().includes(searchLower)) ||
      (app.idNumber?.includes(searchLower)) ||
      (app.originalIndex.toString().includes(searchLower))

    // Date Filter
    let matchesDate = true
    if (dateFilter === 'today') matchesDate = isToday(app.createdAt)
    if (dateFilter === 'week') matchesDate = isThisWeek(app.createdAt)
    if (dateFilter === 'month') matchesDate = isThisMonth(app.createdAt)
    
    return matchesStatus && matchesSearch && matchesDate
  })

  // Statistics
  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    disbursed: applications.filter(app => app.status === 'disbursed').length,
    totalDisbursed: applications
      .filter(app => app.status === 'disbursed' || app.status === 'repaid') // include repaid as they were disbursed
      .reduce((sum, app) => sum + (app.approvedAmount || app.requestedAmount || 0), 0),
    totalRepaid: applications // This assumes we have a way to track repayments. 
      // For now, let's assume fully repaid loans count towards this, 
      // or we'd need a 'repaidAmount' field. Using approvedAmount for 'repaid' status as a proxy.
      .filter(app => app.status === 'repaid')
      .reduce((sum, app) => sum + (app.approvedAmount || app.requestedAmount || 0), 0)
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

  const handleSaveId = () => {
    if (selectedApp && tempIdNumber) {
      setSelectedApp({ 
        ...selectedApp, 
        idNumber: tempIdNumber,
        // Reset verification if ID changed so user can verify again
        identityVerification: tempIdNumber !== selectedApp.idNumber ? undefined : selectedApp.identityVerification 
      });
      setIsEditingId(false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                  <p className="text-sm text-gray-600">Disbursed Count</p>
                  <p className="text-2xl">{stats.disbursed}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Funds Disbursed</p>
                  <p className="text-2xl">
                    {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(stats.totalDisbursed)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Funds Repaid</p>
                  <p className="text-2xl">
                    {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(stats.totalRepaid)}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg">Applications ({filteredApplications.length})</h3>
                <div className="flex gap-2">
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="disbursed">Disbursed</SelectItem>
                      <SelectItem value="repaid">Repaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Input 
                placeholder="Search by #, email, ID, name..." 
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
                      <div className="flex gap-3 items-center">
                        <span className="inline-flex items-center justify-center h-6 min-w-[2rem] px-1.5 rounded bg-slate-100 text-slate-600 text-xs font-mono font-medium">
                          #{app.originalIndex}
                        </span>
                        <div>
                          <p className="text-sm">{app.fullName}</p>
                          <p className="text-xs text-gray-500">{app.email}</p>
                        </div>
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
              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No applications found matching your criteria
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          <div className="lg:col-span-2">
            {selectedApp ? (
              <Tabs defaultValue="details" className="space-y-4">
                <ScrollArea className="w-full whitespace-nowrap pb-2.5">
                  <TabsList className="flex w-full justify-start h-auto gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
                    <TabsTrigger value="details" className="flex-shrink-0">Details</TabsTrigger>
                    <TabsTrigger value="documents" className="flex-shrink-0">Documents</TabsTrigger>
                    <TabsTrigger value="affordability" className="flex-shrink-0">Affordability</TabsTrigger>
                    <TabsTrigger value="credit report" className="flex-shrink-0">Credit Report</TabsTrigger>
                    <TabsTrigger value="account verification" className="flex-shrink-0">Account Verification</TabsTrigger>
                    <TabsTrigger value="decision" className="flex-shrink-0">Decision</TabsTrigger>
                  </TabsList>
                  <ScrollBar orientation="horizontal" className="flex" />
                </ScrollArea>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Details</CardTitle>
                      <CardDescription>ID: {selectedApp.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-600">Full Name</Label>
                          <p className="text-sm">{selectedApp.title} {selectedApp.fullName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Marital Status</Label>
                          <p className="text-sm">{selectedApp.maritalStatus || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">ID Number</Label>
                          <div className="flex flex-wrap items-center gap-2">
                            {isEditingId ? (
                              <div className="flex items-center gap-2">
                                <Input 
                                  value={tempIdNumber}
                                  onChange={(e) => setTempIdNumber(e.target.value)}
                                  className="h-8 w-40 text-sm"
                                />
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleSaveId}>
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsEditingId(false)}>
                                  <XCircle className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{selectedApp.idNumber}</p>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600" 
                                  onClick={() => {
                                    setTempIdNumber(selectedApp.idNumber);
                                    setIsEditingId(true);
                                  }}
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                              </div>
                            )}

                            {!isEditingId && !selectedApp.identityVerification ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleVerifyIdentity}
                                disabled={verifyingIdentity}
                              >
                                {verifyingIdentity ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                ) : (
                                  <Shield className="w-3 h-3 mr-1" />
                                )}
                                Verify Identity
                              </Button>
                            ) : !isEditingId && (
                              <div className="flex gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => setShowVerificationDetails(!showVerificationDetails)}
                                >
                                  {showVerificationDetails ? 'Hide Details' : 'View Details'}
                                </Button>
                              </div>
                            )}
                          </div>
                          {selectedApp.identityVerification && showVerificationDetails && (
                            <div className="mt-4 border rounded-md p-4 bg-gray-50">
                              <h4 className="text-sm font-medium mb-3">Verification Results</h4>
                              {(() => {
                                const data = parseVerificationResult(selectedApp.identityVerification!.rawData);
                                if (!data) return <p className="text-xs text-red-500">Error parsing data</p>;
                                return (
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="text-gray-500">Result</div>
                                    <div className="font-medium">{data.result}</div>
                                    
                                    <div className="text-gray-500">Names</div>
                                    <div className="font-medium">{data.names}</div>
                                    
                                    <div className="text-gray-500">Surname</div>
                                    <div className="font-medium">{data.surname}</div>
                                    
                                    <div className="text-gray-500">ID Number</div>
                                    <div className="font-medium">{data.idNumber}</div>
                                    
                                    <div className="text-gray-500">Deceased Status</div>
                                    <div className={`font-medium ${data.deceasedStatus === 'true' ? 'text-red-600' : 'text-green-600'}`}>
                                      {data.deceasedStatus === 'true' ? 'Deceased' : 'Alive'}
                                    </div>
                                    
                                    <div className="text-gray-500">Marital Status</div>
                                    <div className="font-medium">{data.maritalStatus}</div>

                                    <div className="text-gray-500">Smart Card Issued</div>
                                    <div className="font-medium">{data.smartCardIssued}</div>

                                    <div className="text-gray-500">On HANIS</div>
                                    <div className="font-medium">{data.onHANIS}</div>

                                    <div className="text-gray-500">On NPR</div>
                                    <div className="font-medium">{data.onNPR}</div>
                                  </div>
                                );
                              })()}
                              
                              {/* Raw Response removed */}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Phone</Label>
                          <p className="text-sm">{selectedApp.phone}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Email</Label>
                          <p className="text-sm">{selectedApp.email}</p>
                        </div>
                        {selectedApp.nextOfKin && (
                           <div className="col-span-1 md:col-span-2 border-t pt-2 mt-2">
                            <h4 className="text-sm font-medium mb-2">Next of Kin</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-gray-600">Name</Label>
                                <p className="text-sm">{selectedApp.nextOfKin.name} {selectedApp.nextOfKin.surname}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Relation</Label>
                                <p className="text-sm">{selectedApp.nextOfKin.relation}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-gray-600">Phone</Label>
                                <p className="text-sm">{selectedApp.nextOfKin.phoneNumber} ({selectedApp.nextOfKin.phoneType})</p>
                              </div>
                               <div>
                                <Label className="text-xs text-gray-600">Email</Label>
                                <p className="text-sm">{selectedApp.nextOfKin.email}</p>
                              </div>
                            </div>
                           </div>
                        )}
                        <div>
                          <Label className="text-xs text-gray-600">Employer</Label>
                          <p className="text-sm">{selectedApp.employerName}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Employer Address</Label>
                          <p className="text-sm">{selectedApp.employerAddress || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Employer Phone</Label>
                          <p className="text-sm">{selectedApp.employerPhone || 'Not specified'}</p>
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
                          <Label className="text-xs text-gray-600">Account Type</Label>
                          <p className="text-sm">{selectedApp.accountType}</p>
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

                <TabsContent value="affordability">
                  <Card>
                    <CardHeader>
                      <CardTitle>Affordability Assessment</CardTitle>
                      <CardDescription>Review applicant's income and expenses</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-4">Income</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Net Salary</span>
                              <span className="font-medium">R{selectedApp.netSalary?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Pay Frequency</span>
                              <span className="font-medium capitalize">{selectedApp.paydayCycle}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-4">Monthly Expenses</h3>
                          <div className="space-y-3">
                            {selectedApp.monthlyExpenses && selectedApp.monthlyExpenses.length > 0 ? (
                              <>
                                {selectedApp.monthlyExpenses.map((expense: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-start">
                                    <div>
                                      <span className="text-gray-600 block">{expense.category}</span>
                                      {expense.description && (
                                        <span className="text-xs text-gray-400">{expense.description}</span>
                                      )}
                                    </div>
                                    <span className="font-medium">R{expense.amount.toLocaleString()}</span>
                                  </div>
                                ))}
                                <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                  <span>Total Expenses</span>
                                  <span>R{selectedApp.monthlyExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0).toLocaleString()}</span>
                                </div>
                              </>
                            ) : (
                              <p className="text-gray-500 italic">No expenses recorded</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg mt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-900">Disposable Income</span>
                          <span className="font-bold text-xl text-blue-700">
                            R{((selectedApp.netSalary || 0) - (selectedApp.monthlyExpenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0)).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-6 mt-6">
                        <h3 className="font-medium mb-4">External Financial Data</h3>
                        {!selectedApp.financialSnapshot ? (
                          <div className="flex flex-col items-center justify-center py-4 space-y-4 bg-gray-50 rounded-lg border border-dashed">
                            <p className="text-gray-600 text-sm">No financial snapshot retrieved yet.</p>
                            <Button 
                              onClick={handleGetFinancialSnapshot}
                              disabled={gettingFinancialSnapshot}
                              variant="outline"
                              size="sm"
                            >
                              {gettingFinancialSnapshot ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                  Retrieving...
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="w-4 h-4 mr-2" />
                                  Get Financial Snapshot
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Retrieved
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(selectedApp.financialSnapshot.checkedAt).toLocaleString()}
                                </span>
                              </div>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => setShowFinancialSnapshotDetails(!showFinancialSnapshotDetails)}
                              >
                                {showFinancialSnapshotDetails ? 'Hide Details' : 'View Details'}
                              </Button>
                            </div>

                            {/* Raw Response removed */}
                          </div>
                        )}
                      </div>
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
                        View the applicant's credit score and risk profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!selectedApp.creditScoreCheck ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <p className="text-gray-600">No credit score check performed yet.</p>
                          <Button 
                            onClick={handleGetCreditScore}
                            disabled={checkingCreditScore}
                          >
                            {checkingCreditScore ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Checking...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Get Credit Score
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Checked
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(selectedApp.creditScoreCheck.checkedAt).toLocaleString()}
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleGetCreditScore}
                              disabled={checkingCreditScore}
                            >
                              {checkingCreditScore ? 'Refreshing...' : 'Refresh'}
                            </Button>
                          </div>
                          
                          {(() => {
                            let report = null;
                            let rawData = selectedApp.creditScoreCheck.rawData;
                            
                            // Try to parse using our XML helper first
                            report = parseCreditReportXML(rawData);

                            // Fallback logic for previous JSON format
                            if (!report) {
                                try {
                                  const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                                  report = parsed.creditReport || parsed;
                                } catch (e) {
                                  // silent fail
                                }
                            }

                            if (!report) {
                                return (
                                  <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                                    <pre className="text-xs whitespace-pre-wrap">
                                      {typeof rawData === 'string' ? rawData : JSON.stringify(rawData, null, 2)}
                                    </pre>
                                  </div>
                                );
                            }

                            // Handle different report structures
                            // Structure 1: Experian XML->JSON extracted (results array)
                            if (report.results && Array.isArray(report.results)) {
                                const cpaResult = report.results.find((r: any) => r.resultType === 'CPA') || {};
                                const nlrResult = report.results.find((r: any) => r.resultType === 'NLR') || {};
                                const score = parseInt(cpaResult.score || nlrResult.score || '0');
                                
                                return (
                                  <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* CPA Score Card */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">CPA Credit Score</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-baseline space-x-2">
                                                    <span className={`text-3xl font-bold ${
                                                        score >= 615 ? 'text-green-600' : 
                                                        score >= 580 ? 'text-orange-600' : 'text-red-600'
                                                    }`}>
                                                        {cpaResult.score || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    {cpaResult.reasons?.map((reason: any, idx: number) => (
                                                        <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                            {reason.reasonDescription}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* NLR Score Card */}
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-gray-500">NLR Score</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-baseline space-x-2">
                                                    <span className="text-3xl font-bold text-gray-700">
                                                        {nlrResult.score || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                    {nlrResult.reasons?.map((reason: any, idx: number) => (
                                                        <div key={idx} className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                                            {reason.reasonDescription}
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                     </div>

                                     {/* Raw Response removed */}
                                  </div>
                                )
                            }

                            // Structure 2: Previous/Mock format
                            return (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium text-gray-500">Credit Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="flex items-baseline space-x-2">
                                        <span className={`text-3xl font-bold ${
                                          report.creditScore >= 600 ? 'text-green-600' : 
                                          report.creditScore >= 550 ? 'text-orange-600' : 'text-red-600'
                                        }`}>
                                          {report.creditScore}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">Min required: 550</p>
                                    </CardContent>
                                  </Card>

                                  {/* Disposable Income */}
                                  <Card>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium text-gray-500">Disposable Income</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="text-2xl font-bold">
                                        {new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(report.disposableIncome || 0)}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1">Monthly</p>
                                    </CardContent>
                                  </Card>

                                  {/* Status */}
                                  <Card className={report.approved ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
                                    <CardHeader className="pb-2">
                                      <CardTitle className="text-sm font-medium text-gray-500">Assessment Result</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className={`text-xl font-bold ${report.approved ? 'text-green-700' : 'text-red-700'}`}>
                                        {report.approved ? 'Approved' : 'Declined'}
                                      </div>
                                      <p className="text-xs mt-1 text-gray-600">{report.reason}</p>
                                    </CardContent>
                                  </Card>
                                </div>

                                {/* Raw Details Toggle Removed */}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account verification">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Verification</CardTitle>
                      <CardDescription>
                        Verify the applicant's bank account details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {!selectedApp.accountVerification ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <p className="text-gray-600">No account verification performed yet.</p>
                          <Button 
                            onClick={handleVerifyAccount}
                            disabled={verifyingAccount}
                          >
                            {verifyingAccount ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Verifying...
                              </>
                            ) : (
                              <>
                                <Shield className="w-4 h-4 mr-2" />
                                Verify Account
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Updated
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(selectedApp.accountVerification.checkedAt).toLocaleString()}
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={handleVerifyAccount}
                              disabled={verifyingAccount}
                            >
                              {verifyingAccount ? 'Refreshing...' : 'Refresh'}
                            </Button>
                          </div>
                          
                          {(() => {
                             const result = parseAccountVerificationResult(selectedApp.accountVerification.rawData);
                             if (!result) return <p className="text-red-500">Failed to parse result</p>;
                             
                             const isMatch = (val: string) => val.toLowerCase() === 'match' || val.toLowerCase() === 'yes';

                             return (
                               <div className="space-y-6">
                                 <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                   <div>
                                      <p className="text-xs text-gray-500">Result Code</p>
                                      <p className="font-medium">{result.resultCode}</p>
                                   </div>
                                   <div>
                                      <p className="text-xs text-gray-500">Account Found</p>
                                      <Badge variant={isMatch(result.accountFound) ? 'default' : 'destructive'}>
                                        {result.accountFound}
                                      </Badge>
                                   </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-700">Identity Matches</h4>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">ID Number</span>
                                            <Badge variant={isMatch(result.idMatch) ? 'default' : 'outline'}>{result.idMatch}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Surname</span>
                                            <Badge variant={isMatch(result.surnameMatch) ? 'default' : 'outline'}>{result.surnameMatch}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Initials</span>
                                            <Badge variant={isMatch(result.initialsMatch) ? 'default' : 'outline'}>{result.initialsMatch}</Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium text-sm text-gray-700">Account Status</h4>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Account Open</span>
                                            <span className="font-medium">{result.accountOpen}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Open &gt; 90 Days</span>
                                            <span className="font-medium">{result.accountOpen90Days}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Accepts Credits</span>
                                            <span className="font-medium">{result.accountAcceptsCredits}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Accepts Debits</span>
                                            <span className="font-medium">{result.accountAcceptsDebits}</span>
                                        </div>
                                    </div>
                                 </div>

                                 {/* Raw Response removed */}
                               </div>
                             );
                          })()}
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
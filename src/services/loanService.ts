import { projectId, publicAnonKey } from '../utils/supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1`

export interface LoanApplication {
  id?: string
  userId?: string
  status?: 'draft' | 'pending' | 'approved' | 'declined' | 'disbursed' | 'repaid' | 'archived' | 'counter_offer'
  
  // Archiving
  archived?: boolean
  archivedAt?: string
  originalStatus?: string

  // Counter Offer
  counterOfferAmount?: number
  counterOfferStatus?: 'pending' | 'accepted' | 'declined'

  // Personal Details
  title?: string
  idNumber: string
  fullName: string
  maritalStatus?: string
  phone: string
  email: string
  
  nextOfKin?: {
    name: string
    surname: string
    relation: string
    phoneNumber: string
    phoneType: string // 'Mobile' | 'Home' | 'Work'
    email: string
  }
  
  // Work & Income
  employerName: string
  employerAddress?: string
  employerPhone?: string
  nextPayDate?: string
  paydayCycle: string
  netSalary: number
  monthlyExpenses?: {
    category: string
    amount: number
    description?: string
  }[]
  
  // Banking Details
  bankName: string
  accountType: string
  branchCode: string
  accountNumber: string
  
  // Loan Details
  requestedAmount?: number
  approvedAmount?: number
  interestRate?: number
  fees?: number
  totalDue?: number
  repaymentDate?: string
  
  // Credit Check
  creditScore?: number
  creditCheckPassed?: boolean
  declineReason?: string
  
  creditScoreCheck?: {
    checkedAt: string
    rawData: string
    status: number
  }

  accountVerification?: {
    checkedAt: string
    rawData: string
    status: number
  }
  
  // Documents
  hasIdDocument?: boolean
  hasBankStatements?: boolean
  hasProofOfResidence?: boolean
  hasPayslip?: boolean
  
  // Identity Verification
  identityVerification?: {
    verifiedAt: string
    rawData: string
    status: number
  }
  
  // Credit Score Check
  creditScoreCheck?: {
    checkedAt: string
    rawData: string
    status: number
  }

  creditReport?: CreditReport // Persisted credit report
  
  createdAt?: string
  updatedAt?: string
  decidedAt?: string
  adminNotes?: string
  assignedTo?: string
  assignedToEmail?: string
}

export interface CreditReport {
  id: string
  idNumber: string
  creditScore: number
  creditRisk?: 'excellent' | 'good' | 'fair' | 'poor'
  disposableIncome: number
  maxLoanAmount: number
  existingObligations?: number
  approved: boolean
  reason: string
  source?: 'experian' | 'mock'
  numberOfAccounts?: number
  defaultedAccounts?: number
  judgments?: number
  administrationOrders?: number
  checkedAt: string
}

export const loanService = {
  async createApplication(applicationData: Partial<LoanApplication>, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/loan-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(applicationData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create application')
      }

      return data
    } catch (error: any) {
      console.error('Create application error:', error)
      throw error
    }
  },

  async getApplication(applicationId: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/loan-application/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get application')
      }

      return data.application
    } catch (error: any) {
      console.error('Get application error:', error)
      throw error
    }
  },

  async getMyApplications(accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/my-applications`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get applications')
      }

      return data.applications
    } catch (error: any) {
      console.error('Get my applications error:', error)
      throw error
    }
  },

  async respondToCounterOffer(applicationId: string, accepted: boolean, accessToken: string) {
    try {
      // Fetch current application details first to get the counter offer amount
      const app = await this.getApplication(applicationId, accessToken);
      const counterAmount = app.counterOfferAmount;
      
      let updates: Partial<LoanApplication> = {};

      if (accepted) {
          // If accepted, update requested amount to counter offer amount and reset status to pending for final approval
          updates = {
              status: 'pending',
              requestedAmount: counterAmount,
              adminNotes: (app.adminNotes || '') + `\n[System] Borrower accepted counter offer of R${counterAmount}`,
              counterOfferStatus: 'accepted'
          };
      } else {
          // If declined, mark as declined or withdrawn
          updates = {
              status: 'declined', // Or 'withdrawn' if supported
              declineReason: 'Borrower declined counter offer',
              adminNotes: (app.adminNotes || '') + `\n[System] Borrower declined counter offer`,
              counterOfferStatus: 'declined'
          };
      }

      // Use updateApplication instead of a custom endpoint if custom endpoint is not guaranteed
      return await this.updateApplication(applicationId, updates, accessToken);
    } catch (error: any) {
      console.error('Respond to counter offer error:', error)
      throw error
    }
  },

  async updateApplication(applicationId: string, updates: Partial<LoanApplication>, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/loan-application/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updates)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update application')
      }

      return data.application
    } catch (error: any) {
      console.error('Update application error:', error)
      throw error
    }
  },

  async performCreditCheck(
    idNumber: string,
    income: number,
    existingDebts: number,
    accessToken: string,
    firstName?: string,
    lastName?: string,
    dateOfBirth?: string,
    applicationId?: string
  ): Promise<CreditReport> {
    try {
      const response = await fetch(`${API_BASE}/credit-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          idNumber,
          firstName,
          lastName,
          dateOfBirth,
          income,
          existingDebts,
          applicationId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Credit check failed')
      }

      return data.creditReport
    } catch (error: any) {
      console.error('Credit check error:', error)
      throw error
    }
  }
}
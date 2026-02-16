import { projectId } from '../utils/supabase/info'
import { LoanApplication } from './loanService'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1`

export interface Payment {
  id: string
  applicationId: string
  amount: number
  paymentMethod: string
  paidAt: string
}

export const adminService = {
  async getAllApplications(accessToken: string): Promise<LoanApplication[]> {
    try {
      
      const response = await fetch(`${API_BASE}/admin/applications`, {
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
      console.error('Get all applications error:', error)
      throw error
    }
  },

  async deleteApplication(applicationId: string, accessToken: string) {
    try {
      // Use DELETE verb which Supabase functions typically support for resource endpoints if mapped.
      // If the URL structure is RESTful, this should work.
      const response = await fetch(`${API_BASE}/admin/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        // If DELETE verb fails, fallback to specific delete endpoint if one exists,
        // or check if we need to call a different function.
        // Assuming REST endpoint for now.
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete application')
      }

      return true
    } catch (error: any) {
      console.error('Delete application error:', error)
      throw error
    }
  },

  async verifyDocument(documentId: string, verified: boolean, notes: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/verify-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ documentId, verified, notes })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify document')
      }

      return data.document
    } catch (error: any) {
      console.error('Verify document error:', error)
      throw error
    }
  },

  async updateLoanStatus(
    applicationId: string,
    status: string,
    approvedAmount?: number,
    declineReason?: string,
    accessToken?: string
  ) {
    try {
      const response = await fetch(`${API_BASE}/admin/update-loan-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId, status, approvedAmount, declineReason })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update loan status')
      }

      return data.application
    } catch (error: any) {
      console.error('Update loan status error:', error)
      throw error
    }
  },

  async recordPayment(applicationId: string, amount: number, paymentMethod: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/record-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId, amount, paymentMethod })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record payment')
      }

      return data.payment
    } catch (error: any) {
      console.error('Record payment error:', error)
      throw error
    }
  },

  async sendPaymentReminder(applicationId: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/send-payment-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reminder')
      }

      return data
    } catch (error: any) {
      console.error('Send reminder error:', error)
      throw error
    }
  },

  async getPayments(applicationId: string, accessToken: string): Promise<Payment[]> {
    try {
      const response = await fetch(`${API_BASE}/payments/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get payments')
      }

      return data.payments
    } catch (error: any) {
      console.error('Get payments error:', error)
      throw error
    }
  },

  async verifyIdentity(applicationId: string, identityNumber: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/verify-identity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId, identityNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify identity')
      }

      return data
    } catch (error: any) {
      console.error('Verify identity error:', error)
      throw error
    }
  },

  async getCreditScore(applicationId: string, identityNumber: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/get-credit-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId, identityNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get credit score')
      }

      return data
    } catch (error: any) {
      console.error('Get credit score error:', error)
      throw error
    }
  },

  async verifyAccount(applicationId: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/account-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify account')
      }

      return data
    } catch (error: any) {
      console.error('Verify account error:', error)
      throw error
    }
  },

  async getFinancialSnapshot(applicationId: string, identityNumber: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/financial-snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId, identityNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get financial snapshot')
      }

      return data
    } catch (error: any) {
      console.error('Get financial snapshot error:', error)
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
}
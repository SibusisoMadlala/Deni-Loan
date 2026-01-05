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

  async checkBureauWatchlist(applicationId: string, identityNumber: string, accessToken: string) {
    try {
      const response = await fetch(`${API_BASE}/admin/check-bureau-watchlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ applicationId, identityNumber })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check bureau watchlist')
      }

      return data
    } catch (error: any) {
      console.error('Check bureau watchlist error:', error)
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
}
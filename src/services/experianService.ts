/**
 * Experian API Integration Service
 * Handles all interactions with Experian credit reporting and identity verification APIs
 */

export interface ExperianCredentials {
  clientId: string
  clientSecret: string
  username: string
  password: string
}

export interface ExperianCreditCheckRequest {
  idNumber: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  consent: boolean
}

export interface ExperianCreditCheckResponse {
  score: number
  profile: {
    totalMonthlyObligations: number
    numberOfAccounts: number
    defaultedAccounts: number
    judgments: number
    administrationOrders: number
  }
  summary: {
    risking: string
    enquiryReason: string
  }
}

export interface ExperianIdentityVerificationRequest {
  idNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
}

export interface ExperianIdentityVerificationResponse {
  verified: boolean
  confidence: number
  details: {
    idMatch: boolean
    nameMatch: boolean
    dobMatch: boolean
  }
}

export class ExperianService {
  private clientId: string
  private clientSecret: string
  private username: string
  private password: string
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null
  private readonly API_BASE_URL = 'https://api.experian.co.za' // South African Experian endpoint
  private readonly TOKEN_ENDPOINT = '/oauth2/v1/token'
  private readonly CREDIT_CHECK_ENDPOINT = '/creditrisk/v2/bureaucreditcheck'
  private readonly IDENTITY_ENDPOINT = '/verification/v1/identityverification'

  constructor(credentials: ExperianCredentials) {
    this.clientId = credentials.clientId
    this.clientSecret = credentials.clientSecret
    this.username = credentials.username
    this.password = credentials.password
  }

  /**
   * Get valid access token, refreshing if necessary
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid cached token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}${this.TOKEN_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.username,
          password: this.password,
          scope: 'creditrisk identity'
        }).toString()
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to obtain access token: ${response.status} - ${errorData}`)
      }

      const data = await response.json() as any
      this.accessToken = data.access_token
      
      // Token expires in (expiresIn - 60 seconds buffer)
      const expiresIn = data.expires_in || 3600
      this.tokenExpiry = new Date(Date.now() + (expiresIn - 60) * 1000)

      return this.accessToken
    } catch (error) {
      console.error('Experian token acquisition failed:', error)
      throw new Error('Unable to authenticate with Experian API')
    }
  }

  /**
   * Perform a credit check on an individual
   * @param request Credit check request parameters
   * @returns Credit check response with score and obligations
   */
  async performCreditCheck(
    request: ExperianCreditCheckRequest
  ): Promise<ExperianCreditCheckResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(
        `${this.API_BASE_URL}${this.CREDIT_CHECK_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idNumber: request.idNumber,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth,
            consent: request.consent
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(
          `Credit check failed: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`
        )
      }

      const data = await response.json() as any

      return {
        score: data.creditScore || data.score,
        profile: {
          totalMonthlyObligations: data.totalMonthlyObligations || 0,
          numberOfAccounts: data.numberOfAccounts || 0,
          defaultedAccounts: data.defaultedAccounts || 0,
          judgments: data.judgments || 0,
          administrationOrders: data.administrationOrders || 0
        },
        summary: {
          risking: data.risking || 'UNKNOWN',
          enquiryReason: data.enquiryReason || 'APPLICATION'
        }
      }
    } catch (error) {
      console.error('Experian credit check error:', error)
      throw error
    }
  }

  /**
   * Verify identity information against Experian records
   * @param request Identity verification request parameters
   * @returns Identity verification response
   */
  async verifyIdentity(
    request: ExperianIdentityVerificationRequest
  ): Promise<ExperianIdentityVerificationResponse> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(
        `${this.API_BASE_URL}${this.IDENTITY_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            idNumber: request.idNumber,
            firstName: request.firstName,
            lastName: request.lastName,
            dateOfBirth: request.dateOfBirth
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json() as any
        throw new Error(
          `Identity verification failed: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`
        )
      }

      const data = await response.json() as any

      return {
        verified: data.verified || false,
        confidence: data.confidence || 0,
        details: {
          idMatch: data.idMatch || false,
          nameMatch: data.nameMatch || false,
          dobMatch: data.dobMatch || false
        }
      }
    } catch (error) {
      console.error('Experian identity verification error:', error)
      throw error
    }
  }

  /**
   * Calculate affordability based on credit check data
   * Following NCR guidelines (35% of income for debt service)
   */
  static calculateAffordability(
    monthlyIncome: number,
    existingMonthlyObligations: number,
    requestedLoanAmount: number
  ): {
    approved: boolean
    maxLoanAmount: number
    disposableIncome: number
    affordabilityThreshold: number
    reason: string
  } {
    const disposableIncome = monthlyIncome - existingMonthlyObligations
    const affordabilityThreshold = monthlyIncome * 0.35
    const maxLoanAmount = Math.min(4000, affordabilityThreshold * 3)

    const approved = disposableIncome > 2000 && maxLoanAmount >= 500

    let reason = 'Meets affordability requirements'
    if (disposableIncome <= 2000) {
      reason = 'Insufficient disposable income'
    } else if (maxLoanAmount < 500) {
      reason = 'Affordability assessment failed'
    }

    return {
      approved,
      maxLoanAmount: approved ? Math.floor(maxLoanAmount) : 0,
      disposableIncome,
      affordabilityThreshold,
      reason
    }
  }

  /**
   * Determine credit risk based on Experian score
   */
  static determineCreditRisk(
    score: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 750) return 'excellent'
    if (score >= 650) return 'good'
    if (score >= 550) return 'fair'
    return 'poor'
  }

  /**
   * Check if credit score meets minimum requirement (550)
   */
  static meetsMinimumCreditScore(score: number): boolean {
    return score >= 550
  }
}

/**
 * Factory function to create an Experian service instance
 * Credentials should come from environment variables
 */
export function createExperianService(): ExperianService {
  const credentials: ExperianCredentials = {
    clientId: Deno.env.get('EXPERIAN_CLIENT_ID') || '',
    clientSecret: Deno.env.get('EXPERIAN_CLIENT_SECRET') || '',
    username: Deno.env.get('EXPERIAN_USERNAME') || '',
    password: Deno.env.get('EXPERIAN_PASSWORD') || ''
  }

  if (!credentials.clientId || !credentials.clientSecret || !credentials.username || !credentials.password) {
    throw new Error(
      'Missing Experian credentials. Ensure EXPERIAN_CLIENT_ID, EXPERIAN_CLIENT_SECRET, EXPERIAN_USERNAME, and EXPERIAN_PASSWORD are set.'
    )
  }

  return new ExperianService(credentials)
}

import { projectId } from '../utils/supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1`

const REQUEST_TIMEOUT_MS = 25000
const RETRY_DELAYS_MS = [500, 1200]

function parseJsonSafely(text: string): any {
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { error: text }
  }
}

export interface Document {
  id: string
  userId: string
  applicationId: string
  documentType: 'id' | 'bank_statement' | 'proof_of_residence' | 'payslip'
  fileName: string
  filePath: string
  signedUrl?: string
  uploadedAt: string
  verified: boolean
  verificationNotes?: string
  verifiedAt?: string
}

export const documentService = {
  async uploadDocument(
    file: File,
    applicationId: string,
    documentType: string,
    accessToken: string
  ): Promise<Document> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('applicationId', applicationId)
      formData.append('documentType', documentType)

      const attemptUpload = async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        try {
          const response = await fetch(`${API_BASE}/upload-document`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData,
            signal: controller.signal
          })

          const text = await response.text()
          const data = parseJsonSafely(text)

          if (!response.ok) {
            throw new Error(data.error || `Failed to upload document (HTTP ${response.status})`)
          }

          return data.document
        } finally {
          clearTimeout(timeoutId)
        }
      }

      let lastError: any
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        try {
          return await attemptUpload()
        } catch (err: any) {
          lastError = err

          const message = String(err?.message || '')
          const isAbort = err?.name === 'AbortError'
          const isNetwork = /failed to fetch|networkerror|network request failed/i.test(message)
          const shouldRetry = (isAbort || isNetwork) && attempt < RETRY_DELAYS_MS.length

          if (!shouldRetry) {
            break
          }

          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]))
        }
      }

      if (lastError?.name === 'AbortError') {
        throw new Error('Upload timed out. Please check your connection and try again.')
      }

      const rawMessage = String(lastError?.message || '').toLowerCase()
      if (rawMessage.includes('failed to fetch') || rawMessage.includes('networkerror')) {
        throw new Error('We could not reach the server. Please check your internet connection and try again.')
      }

      throw lastError || new Error('Failed to upload document')
    } catch (error: any) {
      console.error('Upload document error:', error)
      throw error
    }
  },

  async getDocuments(applicationId: string, accessToken: string): Promise<Document[]> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

      try {
        const response = await fetch(`${API_BASE}/documents/${applicationId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          signal: controller.signal
        })

        const text = await response.text()
        const data = parseJsonSafely(text)

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get documents')
        }

        return data.documents
      } finally {
        clearTimeout(timeoutId)
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw new Error('Request timed out while loading documents. Please try again.')
      }
      console.error('Get documents error:', error)
      throw error
    }
  }
}
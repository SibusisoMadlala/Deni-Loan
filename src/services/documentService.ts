import { projectId } from '../utils/supabase/info'

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1`

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

      const response = await fetch(`${API_BASE}/upload-document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document')
      }

      return data.document
    } catch (error: any) {
      console.error('Upload document error:', error)
      throw error
    }
  },

  async getDocuments(applicationId: string, accessToken: string): Promise<Document[]> {
    try {
      const response = await fetch(`${API_BASE}/documents/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get documents')
      }

      return data.documents
    } catch (error: any) {
      console.error('Get documents error:', error)
      throw error
    }
  }
}
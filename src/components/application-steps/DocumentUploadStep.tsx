import { useState, useEffect } from 'react'
import { documentService, Document } from '../../services/documentService'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Alert, AlertDescription } from '../ui/alert'
import { CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react'

interface DocumentUploadStepProps {
  applicationId: string
  accessToken: string
}

export function DocumentUploadStep({ applicationId, accessToken }: DocumentUploadStepProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const docs = await documentService.getDocuments(applicationId, accessToken)
      setDocuments(docs)
    } catch (err: any) {
      console.error('Failed to load documents:', err)
    }
  }

  const handleUpload = async (file: File, documentType: string) => {
    setError('')
    setUploading(documentType)

    try {
      await documentService.uploadDocument(file, applicationId, documentType, accessToken)
      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(null)
    }
  }

  const hasDocument = (type: string) => {
    return documents.some(doc => doc.documentType === type)
  }

  const allRequiredDocumentsUploaded = 
    hasDocument('id') && 
    hasDocument('bank_statement') && 
    hasDocument('proof_of_residence')

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Required Documents:</strong> Please upload clear, legible copies of the following documents.
          All documents are required for NCR compliance and affordability assessment.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ID Document */}
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <Label>South African ID Document</Label>
              {hasDocument('id') && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Photo of your ID card or ID book (both sides)
            </p>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, 'id')
              }}
              disabled={uploading === 'id'}
            />
          </div>
        </div>
        {uploading === 'id' && (
          <p className="text-sm text-blue-600 mt-2">Uploading...</p>
        )}
      </div>

      {/* Bank Statements */}
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <Label>3 Months Bank Statements</Label>
              {hasDocument('bank_statement') && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Recent 3 months of bank statements (PDF or images). Required for NCR affordability assessment.
            </p>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, 'bank_statement')
              }}
              disabled={uploading === 'bank_statement'}
            />
          </div>
        </div>
        {uploading === 'bank_statement' && (
          <p className="text-sm text-blue-600 mt-2">Uploading...</p>
        )}
      </div>

      {/* Proof of Residence */}
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <Label>Proof of Residence</Label>
              {hasDocument('proof_of_residence') && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Utility bill, lease agreement, or municipal rates letter (not older than 3 months)
            </p>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, 'proof_of_residence')
              }}
              disabled={uploading === 'proof_of_residence'}
            />
          </div>
        </div>
        {uploading === 'proof_of_residence' && (
          <p className="text-sm text-blue-600 mt-2">Uploading...</p>
        )}
      </div>

      {/* Payslip (Optional) */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <Label>Payslip (Optional)</Label>
              {hasDocument('payslip') && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Recent payslip - optional if bank statements clearly show income
            </p>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, 'payslip')
              }}
              disabled={uploading === 'payslip'}
            />
          </div>
        </div>
        {uploading === 'payslip' && (
          <p className="text-sm text-blue-600 mt-2">Uploading...</p>
        )}
      </div>

      {allRequiredDocumentsUploaded && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All required documents uploaded successfully. Click "Next" to proceed to credit check.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
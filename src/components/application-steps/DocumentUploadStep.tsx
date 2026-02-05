import { useState, useEffect } from 'react'
import { documentService, Document } from '../../services/documentService'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Alert, AlertDescription } from '../ui/alert'
import { CheckCircle, Upload, FileText, AlertCircle } from 'lucide-react'

interface DocumentUploadStepProps {
  applicationId?: string | null
  accessToken: string
  onValidationChange?: (isValid: boolean) => void
  selectedFiles?: Record<string, File | File[]>
  onFileSelect?: (file: File | File[], type: string) => void
}

export function DocumentUploadStep({ 
  applicationId, 
  accessToken, 
  onValidationChange,
  selectedFiles = {},
  onFileSelect
}: DocumentUploadStepProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (applicationId) {
      loadDocuments()
    }
  }, [applicationId])
  
  // Check documents whenever list changes or selectedFiles changes
  useEffect(() => {
    const hasId = hasDocument('id')
    const hasBank = hasDocument('bank_statement')
    const hasPor = hasDocument('proof_of_residence')
    const hasPayslip = hasDocument('payslip')
    
    // Check if ALL required documents are present
    const valid = hasId && hasBank && hasPor && hasPayslip
    
    // Notify parent component
    if (onValidationChange) {
      onValidationChange(valid)
    }
  }, [documents, selectedFiles, onValidationChange])

  const loadDocuments = async () => {
    if (!applicationId) return
    try {
      const docs = await documentService.getDocuments(applicationId, accessToken)
      setDocuments(docs)
    } catch (err: any) {
      console.error('Failed to load documents:', err)
    }
  }

  const handleUpload = async (files: File | File[], documentType: string) => {
    setError('')

    // If no application ID, just store the file locally via callback
    if (!applicationId) {
      if (onFileSelect) {
        onFileSelect(files, documentType)
      }
      return
    }

    setUploading(documentType)

    try {
      if (Array.isArray(files)) {
        for (const file of files) {
          await documentService.uploadDocument(file, applicationId, documentType, accessToken)
        }
      } else {
        await documentService.uploadDocument(files, applicationId, documentType, accessToken)
      }
      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to upload document')
    } finally {
      setUploading(null)
    }
  }

  const hasDocument = (type: string) => {
    // Check server documents
    if (documents.some(doc => doc.documentType === type)) return true
    // Check locally selected files if we are in "offline" mode
    if (!applicationId && selectedFiles[type]) return true
    return false
  }

  const renderFileList = (type: string) => {
    // Online mode: show server documents
    if (applicationId) {
      const typeDocs = documents.filter(d => d.documentType === type)
      if (typeDocs.length === 0) return null
      return (
        <ul className="mt-2 text-sm text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
          {typeDocs.map((doc, idx) => (
             <li key={doc.id || idx} className="flex items-center text-xs">
               <CheckCircle className="w-3 h-3 text-green-600 mr-2" />
               <span className="truncate max-w-[250px]">{doc.fileName || `Document ${idx + 1}`}</span>
             </li>
          ))}
        </ul>
      )
    } 
    
    // Offline mode: show local selection
    const files = selectedFiles[type]
    if (!files) return null
    
    const fileArray = Array.isArray(files) ? files : [files]
    if (fileArray.length === 0) return null
    
    return (
      <ul className="mt-2 text-sm text-gray-600 space-y-1 bg-gray-50 p-2 rounded">
        {fileArray.map((file, idx) => (
            <li key={idx} className="flex items-center text-xs">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="truncate max-w-[250px]">{file.name}</span>
            </li>
        ))}
      </ul>
    )
  }

  const allRequiredDocumentsUploaded = 
    hasDocument('id') && 
    hasDocument('bank_statement') && 
    hasDocument('proof_of_residence') &&
    hasDocument('payslip')

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
            {renderFileList('id')}
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
              Recent 3 months of bank statements (PDF or images). Required for NCR affordability assessment. You can select multiple files.
            </p>
            <Input
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={(e) => {
                const files = e.target.files
                if (files && files.length > 0) {
                  // Convert FileList to Array
                  handleUpload(Array.from(files), 'bank_statement')
                }
              }}
              disabled={uploading === 'bank_statement'}
            />
            {renderFileList('bank_statement')}
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
            {renderFileList('proof_of_residence')}
          </div>
        </div>
        {uploading === 'proof_of_residence' && (
          <p className="text-sm text-blue-600 mt-2">Uploading...</p>
        )}
      </div>

      {/* Payslip */}
      <div className="border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <Label>Recent Payslip</Label>
              {hasDocument('payslip') && <CheckCircle className="w-5 h-5 text-green-600" />}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Most recent payslip. Required for income verification.
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
            {renderFileList('payslip')}
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
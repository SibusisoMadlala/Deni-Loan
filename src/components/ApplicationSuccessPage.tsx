import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './ui/button'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from './ui/card'

export function ApplicationSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h3>
              <p className="text-gray-600 mb-8">
                Your loan application has been successfully submitted. 
                We have sent a confirmation email to <span className="font-medium text-gray-900">{email || 'your registered email'}</span>.
                Our team will review your documents and get back to you shortly.
              </p>
              <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Mail, Loader2 } from 'lucide-react'
import { projectId, publicAnonKey } from '../utils/supabase/info'

export function EmailVerificationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [type, setType] = useState<'signup' | 'reset'>('signup')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Get email from location state or session storage
    const emailFromState = location.state?.email
    const typeFromState = location.state?.type
    const emailFromStorage = sessionStorage.getItem('signupEmail')
    
    if (typeFromState) {
      setType(typeFromState)
    }

    if (emailFromState) {
      setEmail(emailFromState)
      if (!typeFromState || typeFromState === 'signup') {
        sessionStorage.setItem('signupEmail', emailFromState)
      }
    } else if (emailFromStorage && (!typeFromState || typeFromState === 'signup')) {
      setEmail(emailFromStorage)
    } else {
      // No email found, redirect based on type
      if (typeFromState === 'reset') {
        navigate('/forgot-password')
      } else {
        navigate('/signup')
      }
    }
  }, [location, navigate])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleResendEmail = async () => {
    if (resendTimer > 0) return
    
    setResendLoading(true)
    setMessage(null)

    try {
      if (type === 'reset') {
        const result = await resetPassword(email)
        if (!result.success) {
          throw new Error(result.error || 'Failed to resend reset email')
        }
      } else {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1/resend-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to resend confirmation email')
        }
      }

      setMessage({ text: 'Email sent successfully!', type: 'success' })
      setResendTimer(60) // 60 second cooldown
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to resend email. Please try again.', type: 'error' })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle>{type === 'reset' ? 'Password Reset Link Sent' : 'Email Invite Sent'}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {type === 'reset' ? 'A password reset link' : 'An email invite'} has been sent to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            {type === 'reset' 
              ? 'Please check your email and follow the link to reset your password.'
              : 'Please check your email and follow the link to verify your account.'
            }
          </p>

          {message && (
            <div className={`text-sm p-2 rounded ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="space-y-2 pt-4">
            <Button
              onClick={handleResendEmail}
              disabled={resendLoading || resendTimer > 0}
              variant="outline"
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : resendTimer > 0 ? (
                `Resend Email in ${resendTimer}s`
              ) : (
                'Resend Confirmation Email'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                sessionStorage.removeItem('signupEmail')
                navigate('/signup')
              }}
            >
              Back to Sign Up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

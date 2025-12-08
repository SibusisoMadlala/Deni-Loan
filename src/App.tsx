import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HomePage } from './components/HomePage'
import { LoginPage } from './components/LoginPage'
import { SignupPage } from './components/SignupPage'
import { EmailVerificationPage } from './components/EmailVerificationPage'
import { LoanApplicationPage } from './components/LoanApplicationPage'
import { BorrowerDashboard } from './components/BorrowerDashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Toaster } from './components/ui/sonner'
// App.tsx or your router file
import { PaymentSuccess } from './components/paymentSuccess';
import { PaymentCancel } from './components/paymentCancel';
import { TermsOfService } from './components/TermsOfService';

// Add these routes


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          <Route
            path="/apply"
            element={
              <ProtectedRoute>
                <LoanApplicationPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <BorrowerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </BrowserRouter>
  )
}

// components/PaymentButton.tsx (Updated)

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';

interface PaymentButtonProps {
  applicationId: string;
  amount: number;
  // Use clearer payment type names: due_date (due_payment) and early_payment
  // Keep support for legacy 'first_repayment'
  paymentType: 'due_payment' | 'early_payment' | 'first_repayment' | 'full_settlement';
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  // Optional return URL for Ozow to redirect back to after payment
  returnUrl?: string;
}

export function PaymentButton({ 
  applicationId, 
  amount, 
  paymentType, 
  disabled = false,
  onSuccess,
  onError,
  returnUrl
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const handlePayment = async () => {
    if (!accessToken) {
      const errorMsg = 'Please log in to make payments';
      console.error('❌ No access token');
      onError?.(errorMsg);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Starting payment process...', {
        applicationId,
        amount,
        paymentType
      });
      
      // Redirect directly to the external ozpay URL with query params so the browser navigates there
      const invoiceId = `${applicationId}-${Date.now()}`;
      const returnTo = returnUrl || `${window.location.origin}/payments/ozow/callback`;
      const externalUrl = 'https://website-afa19dec.jdn.ixm.mybluehost.me/ozpay';

      const params = new URLSearchParams({
        invoiceId,
        amount: String(amount),
        paymentType: String(paymentType),
        applicationId: String(applicationId),
        returnUrl: returnTo
      });

      const redirect = `${externalUrl}?${params.toString()}`;
      console.log('Redirecting to external ozpay URL:', redirect);
      // Optionally notify caller before navigation
      onSuccess?.();
      // Navigate browser to external payment endpoint
      window.location.href = redirect;
      return;
      
    } catch (error: any) {
      console.error('❌ Payment initiation error:', error);
      
      let userFriendlyError = 'Failed to process payment';
      
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        userFriendlyError = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('401')) {
        userFriendlyError = 'Session expired. Please log in again.';
      } else if (error.message.includes('404')) {
        userFriendlyError = 'Application not found. Please try again.';
      } else if (error.message.includes('500')) {
        userFriendlyError = 'Server error. Please try again later.';
      } else {
        userFriendlyError = error.message || userFriendlyError;
      }
      
      onError?.(userFriendlyError);
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    switch (paymentType) {
      case 'due_payment':
        return `Pay Due Date - R${amount}`;
      case 'early_payment':
        return `Pay Early - R${amount}`;
      case 'first_repayment':
        return `Pay First Installment - R${amount}`;
      case 'full_settlement':
        return `Full Settlement - R${amount}`;
      default:
        return `Pay R${amount}`;
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading || !accessToken}
      className="w-full"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2" />
      )}
      {loading ? 'Processing...' : getButtonText()}
    </Button>
  );
}
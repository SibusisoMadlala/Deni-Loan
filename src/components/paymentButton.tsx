// components/PaymentButton.tsx (Updated)

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../hooks/useAuth';

interface PaymentButtonProps {
  applicationId: string;
  amount: number;
  paymentType: 'application_fee' | 'first_repayment' | 'full_settlement';
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentButton({ 
  applicationId, 
  amount, 
  paymentType, 
  disabled = false,
  onSuccess,
  onError 
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
      
      const response = await paymentService.createPayment({
        applicationId,
        amount,
        paymentType,
      }, accessToken);

      if (!response.success) {
        throw new Error(response.error || 'Payment creation failed');
      }

      console.log('✅ Payment created, redirecting to PayFast...');
      onSuccess?.();
      
      // Redirect to PayFast
      paymentService.redirectToPayFast(response.paymentUrl);
      
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
      case 'application_fee':
        return `Pay Application Fee - R${amount}`;
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
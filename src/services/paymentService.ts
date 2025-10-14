// services/paymentService.ts (Frontend - Updated)
import { projectId, publicAnonKey } from '../utils/supabase/info'
export interface CreatePaymentRequest {
  applicationId: string;
  amount: number;
  paymentType: 'application_fee' | 'first_repayment' | 'full_settlement';
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl: string;
  amount: number;
  paymentType: string;
  error?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  amount: number;
  paymentType: string;
  createdAt: string;
  completedAt?: string;
}

class PaymentService {
  private baseUrl: string;

  constructor() {
    // Use the full URL to your Supabase function
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-1ed353c1`;
  }

  async createPayment(request: CreatePaymentRequest, accessToken: string): Promise<CreatePaymentResponse> {
    try {
      console.log('🔄 Creating payment request:', request);
      
      const response = await fetch(`${this.baseUrl}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(request),
      });

      console.log('📡 Payment response status:', response.status);
      
      // Check if response is OK and has content
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          // Try to parse error response as JSON
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If JSON parsing fails, get the text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Check if response has content
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {
        throw new Error('Empty response from server');
      }

      // Parse the successful response
      const data = await response.json();
      console.log('✅ Payment created successfully:', data);
      
      return data;

    } catch (error: any) {
      console.error('❌ Payment service error:', error);
      throw new Error(error.message || 'Failed to create payment');
    }
  }

  async getPaymentStatus(paymentId: string, accessToken: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/payment/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get payment status');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Get payment status error:', error);
      throw error;
    }
  }

  // Helper method to redirect to PayFast
  redirectToPayFast(paymentUrl: string): void {
    console.log('🔗 Redirecting to PayFast:', paymentUrl);
    window.location.href = paymentUrl;
  }
}

export const paymentService = new PaymentService();
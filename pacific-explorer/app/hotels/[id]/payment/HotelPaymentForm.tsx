'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, AlertCircle } from 'lucide-react';

interface HotelPaymentFormProps {
  bookingId: number;
  amount: number;
  currency: string;
  paymentIntentId: string | null;
  hotelId: number;
}

export default function HotelPaymentForm({
  bookingId,
  amount,
  currency,
  paymentIntentId,
  hotelId
}: HotelPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/hotels/${hotelId}/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'An error occurred during payment.');
        setIsLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded, redirect to confirmation
        router.push(`/hotels/${hotelId}/confirmation?payment_intent=${paymentIntent.id}&booking_id=${bookingId}`);
      } else {
        setMessage('Payment processing...');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CreditCard className="w-4 h-4" />
          <span>Enter your payment details</span>
        </div>

        <PaymentElement
          options={{
            layout: 'tabs',
          }}
          className="w-full"
        />
      </div>

      {message && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-700 text-sm">{message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-ocean-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-ocean-700 focus:ring-2 focus:ring-ocean-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay $${amount.toFixed(2)} ${currency.toUpperCase()}`
        )}
      </button>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Your payment information is encrypted and secure</p>
        <p>• You can cancel your booking up to 24 hours before check-in</p>
        <p>• Instant confirmation upon successful payment</p>
      </div>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Shield, CheckCircle } from 'lucide-react';

interface HireCarPaymentFormInnerProps {
  hireCar: {
    id: number;
    name: string;
    province: string;
    city: string | null;
    pricePerDay: number | null;
  };
  hireCarBookingId?: string;
}

export default function HireCarPaymentFormInner({
  hireCar,
  hireCarBookingId,
}: HireCarPaymentFormInnerProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case 'succeeded':
          setMessage('Payment succeeded!');
          setIsCompleted(true);
          break;
        case 'processing':
          setMessage('Your payment is processing.');
          break;
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.');
          break;
        default:
          setMessage('Something went wrong.');
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/hirecars/${hireCar.id}/confirmation?hireCarBookingId=${hireCarBookingId}`,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setMessage(error.message || 'An error occurred.');
      } else {
        setMessage('An unexpected error occurred.');
      }
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Payment Successful!
        </h3>
        <p className="text-gray-600 mb-4">
          Your car rental booking has been confirmed.
        </p>
        <button
          onClick={() => router.push(`/hirecars/${hireCar.id}/confirmation?hireCarBookingId=${hireCarBookingId}`)}
          className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
        >
          View Booking Details
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Payment Information
        </label>
        <div className="border border-gray-300 rounded-lg p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500 mr-2" />
          <span>
            Your payment information is secure and encrypted. We use Stripe for secure payment processing.
          </span>
        </div>
      </div>

      {/* Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('succeeded') || message.includes('processing')
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Submit Button */}
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
          'Complete Payment'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By completing this payment, you agree to our terms of service and cancellation policy.
      </p>
    </form>
  );
}

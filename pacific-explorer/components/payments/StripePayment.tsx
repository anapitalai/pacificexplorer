'use client';

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripePaymentFormProps {
  bookingId: number;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({ bookingId, amount, currency, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/${bookingId}/confirmation`,
        },
        redirect: 'if_required', // Only redirect if required (e.g., for 3D Secure)
      });

      if (error) {
        setMessage(error.message || 'An error occurred during payment.');
        onError(error.message || 'Payment failed');
      } else {
        // Payment succeeded - call success callback
        setMessage('Payment successful! Redirecting...');
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setMessage(errorMessage);
      onError(errorMessage);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Processing...' : `Pay ${amount} ${currency.toUpperCase()}`}
      </button>
      {message && (
        <div className={`text-sm ${message.includes('error') ? 'text-red-600' : 'text-gray-600'}`}>
          {message}
        </div>
      )}
    </form>
  );
}

interface StripePaymentProps {
  bookingId: number;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function StripePayment({
  bookingId,
  amount,
  currency,
  onSuccess,
  onError,
}: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
          type: 'destination',
          bookingId 
        }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [bookingId, onError]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">Loading payment form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Complete Payment</h3>
      </div>
      <div className="p-6">
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            bookingId={bookingId}
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </div>
    </div>
  );
}

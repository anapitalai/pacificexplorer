'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import HireCarPaymentFormInner from './HireCarPaymentFormInner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface HireCarPaymentFormProps {
  hireCar: {
    id: number;
    name: string;
    province: string;
    city: string | null;
    pricePerDay: number | null;
  };
  paymentIntentId: string;
  hireCarBookingId?: string;
}

export default function HireCarPaymentForm({
  hireCar,
  paymentIntentId,
  hireCarBookingId,
}: HireCarPaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the payment intent
    const retrievePaymentIntent = async () => {
      try {
        const response = await fetch(`/api/payments/retrieve-intent?payment_intent=${paymentIntentId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to retrieve payment intent');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error retrieving payment intent:', err);
        setError(err instanceof Error ? err.message : 'Failed to load payment form');
      } finally {
        setLoading(false);
      }
    };

    retrievePaymentIntent();
  }, [paymentIntentId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ {error}</div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">Unable to load payment form</div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-ocean-600 text-white p-6">
        <h2 className="text-xl font-semibold mb-2">Payment Details</h2>
        <p className="text-ocean-100">
          Complete your booking for {hireCar.name}
        </p>
      </div>

      {/* Payment Form */}
      <div className="p-6">
        <Elements stripe={stripePromise} options={options}>
          <HireCarPaymentFormInner
            hireCar={hireCar}
            hireCarBookingId={hireCarBookingId}
          />
        </Elements>
      </div>
    </div>
  );
}

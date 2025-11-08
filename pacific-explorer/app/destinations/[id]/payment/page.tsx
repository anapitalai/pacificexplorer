'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, Shield, Lock } from 'lucide-react';
import DestinationPaymentForm from './DestinationPaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DestinationBooking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  destination: {
    id: number;
    name: string;
    province: string;
    category: string;
    description: string;
  };
  tourist: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

export default function DestinationPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<DestinationBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    const fetchBookingAndCreateIntent = async () => {
      if (!bookingId) {
        setError('Booking ID is required');
        setLoading(false);
        return;
      }

      try {
        // Fetch booking details
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        const data = await response.json();
        setBooking(data.booking);

        // Create payment intent
        const intentResponse = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'destination',
            bookingId: parseInt(bookingId),
          }),
        });

        const intentData = await intentResponse.json();

        if (!intentResponse.ok) {
          throw new Error(intentData.error || 'Failed to create payment intent');
        }

        setClientSecret(intentData.clientSecret);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndCreateIntent();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    );
  }

  if (error || !booking || !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Booking not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Booking Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h1>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{booking.destination.name}</h2>
                <p className="text-gray-600">{booking.destination.category} • {booking.destination.province}</p>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights:</span>
                  <span className="font-medium">{calculateNights()}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${booking.totalAmount.toFixed(2)} {booking.currency}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Includes 10% platform fee (${(booking.totalAmount * 0.1).toFixed(2)})
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CreditCard className="w-6 h-6 text-ocean-600" />
              <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
            </div>

            <div className="flex items-center space-x-2 mb-6 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>SSL Encrypted & Secure</span>
              <Lock className="w-4 h-4 text-green-600 ml-4" />
              <span>PCI Compliant</span>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <DestinationPaymentForm
                bookingId={booking.id}
                amount={booking.totalAmount}
                currency={booking.currency}
                destinationId={booking.destination.id}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}

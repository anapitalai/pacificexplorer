'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingConfirmationClientProps {
  bookingId: number;
  initialStatus: string;
}

export default function BookingConfirmationClient({
  bookingId,
  initialStatus,
}: BookingConfirmationClientProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (status === 'PENDING') {
      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/bookings/${bookingId}/status`);
          const data = await response.json();
          if (data.status === 'CONFIRMED') {
            setStatus('CONFIRMED');
            router.refresh(); // Refresh the page to show confirmed state
          }
        } catch (error) {
          console.error('Error checking booking status:', error);
        }
      };

      // Check immediately
      checkStatus();

      // Then check every 3 seconds for up to 30 seconds
      const interval = setInterval(checkStatus, 3000);
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 30000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [bookingId, status, router]);

  if (status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Payment...
            </h1>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your payment. This may take a few moments.
            </p>
            <p className="text-sm text-gray-500">
              Booking ID: #{bookingId}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null; // Let the server component handle confirmed bookings
}

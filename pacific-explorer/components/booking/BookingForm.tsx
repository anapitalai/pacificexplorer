'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Destination {
  id: number;
  name: string;
  description: string;
  pricePerNight?: number; // Made optional
}

interface BookingFormProps {
  destination: Destination;
}

export default function BookingForm({ destination }: BookingFormProps) {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate) return 0;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Use destination price or default to $150/night for destinations
    const pricePerNight = destination.pricePerNight || 150;
    return nights > 0 ? nights * pricePerNight : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationId: destination.id,
          checkInDate,
          checkOutDate,
          totalAmount: calculateTotal(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirect to payment page instead of showing inline payment
      router.push(`/destinations/${destination.id}/payment?booking_id=${data.booking.id}`);
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = calculateTotal();
  const minCheckInDate = new Date().toISOString().split('T')[0];
  const minCheckOutDate = checkInDate || minCheckInDate;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Book {destination.name}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date
            </label>
            <input
              type="date"
              id="checkInDate"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              min={minCheckInDate}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date
            </label>
            <input
              type="date"
              id="checkOutDate"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={minCheckOutDate}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {totalAmount > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-lg font-semibold text-gray-900">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Includes 10% commission fee paid to business owner
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || totalAmount === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating Booking...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}

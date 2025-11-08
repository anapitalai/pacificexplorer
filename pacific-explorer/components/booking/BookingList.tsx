'use client';

import { useState, useEffect, useCallback } from 'react';

interface Booking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  destination: {
    name: string;
    owner: {
      name: string;
    };
  };
  commission?: {
    amount: number;
    status: string;
  };
  createdAt: string;
}

interface BookingListProps {
  userRole?: 'ADMIN' | 'BUSINESS' | 'TOURIST';
}

export default function BookingList({ userRole }: BookingListProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await fetch(`/api/bookings?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      setBookings(data.bookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking');
      }

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.destination.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hosted by {booking.destination.owner.name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Check-in</p>
                  <p className="font-medium">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Check-out</p>
                  <p className="font-medium">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-medium">${booking.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              {booking.commission && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-gray-600">
                    Commission: ${booking.commission.amount.toFixed(2)} ({booking.commission.status})
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </p>

                {userRole === 'ADMIN' && booking.status === 'PENDING' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

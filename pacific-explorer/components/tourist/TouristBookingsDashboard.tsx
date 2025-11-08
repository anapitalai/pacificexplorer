'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Calendar, MapPin, Hotel, Car, Mountain, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Booking {
  id: number;
  type: 'hotel' | 'destination' | 'hirecar';
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  checkInDate?: string;
  checkOutDate?: string;
  pickupDate?: string;
  returnDate?: string;
  createdAt: string;
  hotel?: {
    id: number;
    name: string;
    city: string;
    province: string;
  };
  destination?: {
    id: number;
    name: string;
    province: string;
    category: string;
  };
  hireCar?: {
    id: number;
    name: string;
    vehicleType: string;
    location: string;
  };
}

export default function TouristBookingsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'paid'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/my-bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'pending') return booking.paymentStatus === 'PENDING';
    if (filter === 'confirmed') return booking.status === 'CONFIRMED';
    if (filter === 'paid') return booking.paymentStatus === 'PAID';
    return true;
  });

  const getBookingIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Hotel className="w-5 h-5" />;
      case 'destination': return <Mountain className="w-5 h-5" />;
      case 'hirecar': return <Car className="w-5 h-5" />;
      default: return <MapPin className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PAID':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPaymentUrl = (booking: Booking) => {
    if (booking.type === 'hotel' && booking.hotel) {
      return `/hotels/${booking.hotel.id}/payment?booking_id=${booking.id}`;
    }
    if (booking.type === 'destination' && booking.destination) {
      return `/destinations/${booking.destination.id}/payment?booking_id=${booking.id}`;
    }
    if (booking.type === 'hirecar' && booking.hireCar) {
      return `/hirecars/${booking.hireCar.id}/payment?booking_id=${booking.id}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-png-black">My Bookings</h2>
          <p className="text-gray-600 mt-1">Track your reservations and payments</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-ocean-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Payment
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">Start exploring and make your first booking!</p>
          <Link
            href="/explore"
            className="inline-flex items-center px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            Explore Destinations
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={`${booking.type}-${booking.id}`}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-3 bg-ocean-50 rounded-lg">
                    {getBookingIcon(booking.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.hotel?.name || booking.destination?.name || booking.hireCar?.name}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {booking.hotel?.city || booking.destination?.province || booking.hireCar?.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {booking.checkInDate && new Date(booking.checkInDate).toLocaleDateString()}
                          {booking.pickupDate && new Date(booking.pickupDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        {getPaymentStatusIcon(booking.paymentStatus)}
                        <span className="text-sm font-medium text-gray-700">
                          {booking.paymentStatus === 'PAID' ? 'Payment Completed' : 'Payment Pending'}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-ocean-600">
                        ${booking.totalAmount.toFixed(2)} {booking.currency}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  {booking.paymentStatus === 'PENDING' && (
                    <Link
                      href={getPaymentUrl(booking)}
                      className="inline-flex items-center px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm font-medium"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment
                    </Link>
                  )}
                  {booking.paymentStatus === 'PAID' && booking.type === 'hotel' && (
                    <Link
                      href={`/hotels/${booking.hotel?.id}/confirmation?booking_id=${booking.id}`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      View Confirmation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                  {booking.paymentStatus === 'PAID' && booking.type === 'destination' && (
                    <Link
                      href={`/destinations/${booking.destination?.id}/confirmation?booking_id=${booking.id}`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      View Confirmation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  )}
                  <span className="text-xs text-gray-500">
                    Booked {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-png-black">{bookings.length}</p>
            <p className="text-sm text-gray-600">Total Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.paymentStatus === 'PENDING').length}
            </p>
            <p className="text-sm text-gray-600">Pending Payment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.paymentStatus === 'PAID').length}
            </p>
            <p className="text-sm text-gray-600">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-ocean-600">
              ${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
      </div>
    </div>
  );
}

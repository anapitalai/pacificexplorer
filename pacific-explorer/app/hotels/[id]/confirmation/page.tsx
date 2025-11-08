'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Calendar, Users, MapPin, Mail, Phone, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface HotelBooking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  rooms: number;
  specialRequests: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  hotel: {
    id: number;
    name: string;
    province: string;
    city: string | null;
    address: string | null;
    starRating: number | null;
    phone: string | null;
    email: string | null;
  };
  tourist: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
}

export default function HotelConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<HotelBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const bookingId = urlParams.get('booking_id');

      if (!bookingId) {
        setError('Booking ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/hotel-bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        const data = await response.json();
        setBooking(data.booking);

        // If booking is still pending, start polling for status updates
        if (data.booking.status === 'PENDING') {
          setIsProcessing(true);
          pollBookingStatus(bookingId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  const pollBookingStatus = (bookingId: string) => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/hotel-bookings/${bookingId}`);
        if (!response.ok) return;

        const data = await response.json();
        const foundBooking = data.booking;

        if (foundBooking && foundBooking.status === 'CONFIRMED') {
          setBooking(foundBooking);
          setIsProcessing(false);
          return; // Stop polling
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
      setIsProcessing(false); // Stop processing after timeout
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600"></div>
      </div>
    );
  }

  if (error || !booking) {
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

  // Show processing state if payment is still being processed
  if (isProcessing || booking.status === 'PENDING') {
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
              Booking ID: #{booking.id}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if payment failed
  if (booking.status === 'CANCELLED' || booking.paymentStatus === 'FAILED') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h1>
            <p className="text-gray-600 mb-4">
              Your payment could not be processed. Please try again or contact support.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Booking ID: #{booking.id}
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/contact"
                className="px-6 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const calculateNights = () => {
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert('Receipt download feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-lg text-gray-600">
            Your hotel reservation has been successfully processed
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Booking ID: #{booking.id.toString().padStart(6, '0')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Hotel Details</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{booking.hotel.name}</h3>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{booking.hotel.city}, {booking.hotel.province}</span>
                  </div>
                  {booking.hotel.starRating && (
                    <div className="flex items-center mt-2">
                      {[...Array(booking.hotel.starRating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">⭐</span>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {booking.hotel.starRating} Star Hotel
                      </span>
                    </div>
                  )}
                </div>

                {booking.hotel.address && (
                  <div className="text-gray-600">
                    <strong>Address:</strong> {booking.hotel.address}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  {booking.hotel.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{booking.hotel.phone}</span>
                    </div>
                  )}
                  {booking.hotel.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail className="w-4 h-4 mr-1" />
                      <span>{booking.hotel.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reservation Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-ocean-600 mr-2" />
                    <div>
                      <div className="font-medium">Check-in</div>
                      <div className="text-gray-600">
                        {new Date(booking.checkInDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-ocean-600 mr-2" />
                    <div>
                      <div className="font-medium">Check-out</div>
                      <div className="text-gray-600">
                        {new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-ocean-600 mr-2" />
                    <div>
                      <div className="font-medium">Guests</div>
                      <div className="text-gray-600">{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-ocean-100 rounded flex items-center justify-center mr-2">
                      <span className="text-xs font-bold text-ocean-600">🏨</span>
                    </div>
                    <div>
                      <div className="font-medium">Rooms</div>
                      <div className="text-gray-600">{booking.rooms} room{booking.rooms !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 mb-2">Special Requests</div>
                  <div className="text-gray-600">{booking.specialRequests}</div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{calculateNights()} nights</span>
                  <span className="font-medium">${(booking.totalAmount * 0.9).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform fee (10%)</span>
                  <span className="font-medium">${(booking.totalAmount * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid</span>
                    <span>${booking.totalAmount.toFixed(2)} {booking.currency}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadReceipt}
                className="w-full mt-4 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </button>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What&apos;s Next?</h2>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                  <span>You&apos;ll receive a confirmation email shortly</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                  <span>The hotel will contact you directly for check-in details</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                  <span>You can cancel up to 24 hours before check-in</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/dashboard"
                className="w-full block text-center px-4 py-3 bg-ocean-600 text-white rounded-lg font-semibold hover:bg-ocean-700 transition-colors"
              >
                View My Bookings
              </Link>
              <Link
                href="/explore"
                className="w-full block text-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Explore More Destinations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Calendar, MapPin, Mail, Download, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DestinationBooking {
  id: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
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

export default function DestinationConfirmationPage() {
  const [booking, setBooking] = useState<DestinationBooking | null>(null);
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
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        const data = await response.json();
        setBooking(data.booking);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil(Math.abs(checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  const handleDownloadConfirmation = async () => {
    if (!booking) return;

    setIsProcessing(true);
    try {
      // In a real implementation, this would generate a PDF
      // For now, we'll just create a simple text confirmation
      const confirmationText = `
Pacific Explorer - Booking Confirmation

Booking ID: ${booking.id}
Destination: ${booking.destination.name}
Location: ${booking.destination.province}

Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
Nights: ${calculateNights()}

Total Amount: $${booking.totalAmount.toFixed(2)} ${booking.currency}

Payment Status: ${booking.paymentStatus}
Booking Status: ${booking.status}

Booked by: ${booking.tourist.name || 'N/A'}
Email: ${booking.tourist.email}

Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}

Thank you for choosing Pacific Explorer!
      `.trim();

      const blob = new Blob([confirmationText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-confirmation-${booking.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading confirmation:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ocean-600 mx-auto mb-4"></div>
          <p className="text-ocean-700 font-medium">Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Confirmation Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <Link href="/" className="inline-block px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-all">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your destination booking has been successfully processed</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Confirmed
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Destination Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-ocean-600" />
                Destination
              </h3>
              <div className="space-y-2">
                <p className="text-xl font-medium text-gray-900">{booking.destination.name}</p>
                <p className="text-gray-600">{booking.destination.category} • {booking.destination.province}</p>
                <p className="text-sm text-gray-500 mt-2">{booking.destination.description}</p>
              </div>
            </div>

            {/* Booking Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-ocean-600" />
                Booking Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium">#{booking.id}</span>
                </div>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">${booking.totalAmount.toFixed(2)} {booking.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tourist Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-ocean-600" />
              Guest Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{booking.tourist.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{booking.tourist.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadConfirmation}
            disabled={isProcessing}
            className="inline-flex items-center px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5 mr-2" />
            {isProcessing ? 'Generating...' : 'Download Confirmation'}
          </button>

          <Link
            href={`/destinations/${booking.destination.id}`}
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-center"
          >
            View Destination Details
          </Link>

          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-center"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Important Information</h3>
          <ul className="space-y-2 text-blue-800">
            <li>• A confirmation email has been sent to your registered email address</li>
            <li>• Please arrive at your destination on time for your scheduled check-in</li>
            <li>• Keep this confirmation for your records</li>
            <li>• Contact us if you need to make changes to your booking</li>
            <li>• Free cancellation up to 24 hours before your visit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

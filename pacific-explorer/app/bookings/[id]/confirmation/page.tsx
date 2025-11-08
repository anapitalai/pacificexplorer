import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../../../lib/prisma';
import { CheckCircle, Calendar, MapPin, CreditCard } from 'lucide-react';
import BookingConfirmationClient from './BookingConfirmationClient';

interface BookingConfirmationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const resolvedParams = await params;
  const bookingId = parseInt(resolvedParams.id);

  if (isNaN(bookingId)) {
    notFound();
  }

  // Fetch booking with related data
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      destination: {
        include: {
          owner: {
            select: {
              name: true,
            },
          },
        },
      },
      tourist: {
        select: {
          name: true,
          email: true,
        },
      },
      commission: true,
    },
  });

  if (!booking) {
    notFound();
  }

  // Handle different booking statuses
  if (booking.status === 'PENDING') {
    return <BookingConfirmationClient bookingId={bookingId} initialStatus={booking.status} />;
  }

  if (booking.status !== 'CONFIRMED') {
    notFound();
  }

  const commissionAmount = booking.totalAmount * 0.1;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your reservation has been successfully confirmed and payment processed.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold">#{booking.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Destination:</span>
              <span className="font-semibold">{booking.destination.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Check-in:</span>
              <span className="font-semibold">
                {new Date(booking.checkInDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Check-out:</span>
              <span className="font-semibold">
                {new Date(booking.checkOutDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Guest:</span>
              <span className="font-semibold">{booking.tourist.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-lg">
                ${booking.totalAmount.toFixed(2)} {booking.currency.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Platform Commission (10%):</span>
              <span className="font-semibold text-green-600">
                ${commissionAmount.toFixed(2)} {booking.currency.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Business Owner Receives:</span>
              <span className="font-semibold">
                ${(booking.totalAmount - commissionAmount).toFixed(2)} {booking.currency.toUpperCase()}
              </span>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              Payment processed successfully via Stripe. The commission will be paid out to the business owner.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Owner Information
          </h2>
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Business Owner:</span>
              <span className="font-semibold">{booking.destination.owner?.name || 'Not assigned'}</span>
            </div>

            {booking.commission && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <div className="text-sm text-green-700">
                  ✅ Commission of ${booking.commission.amount.toFixed(2)} has been recorded and will be paid out to the business owner.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            A confirmation email has been sent to {booking.tourist.email}
          </p>
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              href="/"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Explore More Destinations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

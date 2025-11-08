import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckCircle, MapPin, Car, CreditCard, Phone, Mail } from 'lucide-react';

interface HireCarConfirmationPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    hireCarBookingId?: string;
  }>;
}

export default async function HireCarConfirmationPage({
  params,
  searchParams,
}: HireCarConfirmationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const hireCarId = parseInt(resolvedParams.id);
  const hireCarBookingId = resolvedSearchParams.hireCarBookingId;

  if (isNaN(hireCarId)) {
    redirect("/hirecars");
  }

  // Fetch hire car booking details
  let hireCarBooking = null;
  if (hireCarBookingId) {
    hireCarBooking = await prisma.hireCarBooking.findUnique({
      where: { id: parseInt(hireCarBookingId) },
      include: {
        hireCar: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
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
  }

  // If no booking found, try to find the most recent booking for this hire car by this user
  if (!hireCarBooking) {
    hireCarBooking = await prisma.hireCarBooking.findFirst({
      where: {
        hireCarId: hireCarId,
        touristId: session.user.id,
        status: 'CONFIRMED',
      },
      include: {
        hireCar: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
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
      orderBy: { createdAt: 'desc' },
    });
  }

  if (!hireCarBooking) {
    redirect("/hirecars");
  }

  // Check if user owns this booking
  if (hireCarBooking.touristId !== session.user.id) {
    redirect("/hirecars");
  }

  const commissionAmount = hireCarBooking.totalAmount * 0.1;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Car Rental Confirmed!
          </h1>
          <p className="text-gray-600">
            Your vehicle reservation has been successfully confirmed and payment processed.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Car className="h-5 w-5" />
            Rental Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold">#{hireCarBooking.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-semibold">{hireCarBooking.hireCar.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Pickup Date:</span>
              <span className="font-semibold">
                {new Date(hireCarBooking.pickupDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Return Date:</span>
              <span className="font-semibold">
                {new Date(hireCarBooking.returnDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Pickup Location:</span>
              <span className="font-semibold">{hireCarBooking.pickupLocation}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Return Location:</span>
              <span className="font-semibold">{hireCarBooking.returnLocation}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Guest:</span>
              <span className="font-semibold">{hireCarBooking.tourist.name}</span>
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
                ${hireCarBooking.totalAmount.toFixed(2)} {hireCarBooking.currency.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Platform Commission (10%):</span>
              <span className="font-semibold text-green-600">
                ${commissionAmount.toFixed(2)} {hireCarBooking.currency.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Business Owner Receives:</span>
              <span className="font-semibold">
                ${(hireCarBooking.totalAmount - commissionAmount).toFixed(2)} {hireCarBooking.currency.toUpperCase()}
              </span>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              Payment processed successfully via Stripe. The commission will be paid out to the business owner.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Business Owner Information
          </h2>
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Business Owner:</span>
              <span className="font-semibold">{hireCarBooking.hireCar.owner?.name || 'Not assigned'}</span>
            </div>

            {hireCarBooking.commission && (
              <div className="mt-4 p-3 bg-green-50 rounded-md">
                <div className="text-sm text-green-700">
                  ✅ Commission of ${hireCarBooking.commission.amount.toFixed(2)} has been recorded and will be paid out to the business owner.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {(hireCarBooking.hireCar.phone || hireCarBooking.hireCar.email) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-2">
              {hireCarBooking.hireCar.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{hireCarBooking.hireCar.phone}</span>
                </div>
              )}
              {hireCarBooking.hireCar.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">{hireCarBooking.hireCar.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            A confirmation email has been sent to {hireCarBooking.tourist.email}
          </p>
          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              View My Bookings
            </Link>
            <Link
              href="/hirecars"
              className="inline-block bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Rent Another Car
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

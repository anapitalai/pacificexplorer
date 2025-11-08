import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const touristId = session.user.id;

    // Fetch all hotel bookings
    const hotelBookings = await prisma.hotelBooking.findMany({
      where: { touristId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            city: true,
            province: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all destination bookings
    const destinationBookings = await prisma.booking.findMany({
      where: { touristId },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            province: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all hire car bookings
    const hireCarBookings = await prisma.hireCarBooking.findMany({
      where: { touristId },
      include: {
        hireCar: {
          select: {
            id: true,
            name: true,
            vehicleType: true,
            city: true,
            province: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format all bookings into a unified structure
    const allBookings = [
      ...hotelBookings.map(booking => ({
        id: booking.id,
        type: 'hotel' as const,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        checkInDate: booking.checkInDate.toISOString(),
        checkOutDate: booking.checkOutDate.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        hotel: booking.hotel,
      })),
      ...destinationBookings.map(booking => ({
        id: booking.id,
        type: 'destination' as const,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        checkInDate: booking.checkInDate.toISOString(),
        checkOutDate: booking.checkOutDate.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        destination: booking.destination,
      })),
      ...hireCarBookings.map(booking => ({
        id: booking.id,
        type: 'hirecar' as const,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        pickupDate: booking.pickupDate.toISOString(),
        returnDate: booking.returnDate.toISOString(),
        createdAt: booking.createdAt.toISOString(),
        hireCar: {
          id: booking.hireCar.id,
          name: booking.hireCar.name,
          vehicleType: booking.hireCar.vehicleType || 'Vehicle',
          location: `${booking.hireCar.city || ''}, ${booking.hireCar.province}`.trim(),
        },
      })),
    ];

    // Sort by creation date (most recent first)
    allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      bookings: allBookings,
      total: allBookings.length,
      hotelCount: hotelBookings.length,
      destinationCount: destinationBookings.length,
      hireCarCount: hireCarBookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

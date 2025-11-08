import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/hotel-bookings/[id] - Get a specific hotel booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookingId = parseInt(resolvedParams.id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const booking = await prisma.hotelBooking.findUnique({
      where: { id: bookingId },
      include: {
        hotel: {
          select: {
            id: true,
            name: true,
            province: true,
            city: true,
            address: true,
            starRating: true,
            images: true,
            featuredImage: true,
          },
        },
        tourist: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        commission: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns this booking
    if (booking.touristId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching hotel booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

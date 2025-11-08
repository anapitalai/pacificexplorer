import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/bookings - Get user's bookings or all bookings (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, CONFIRMED, CANCELLED, COMPLETED
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user role to determine what bookings to show
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const whereClause: {
      touristId?: string;
      status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    } = {};

    if (user.role === 'ADMIN') {
      // Admin can see all bookings
      if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
        whereClause.status = status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
      }
    } else {
      // Regular users can only see their own bookings
      whereClause.touristId = session.user.id;
      if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
        whereClause.status = status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
      }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        destination: {
          include: {
            owner: {
              select: { name: true, email: true },
            },
          },
        },
        tourist: {
          select: { name: true, email: true },
        },
        commission: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.booking.count({ where: whereClause });

    return NextResponse.json({
      bookings,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { destinationId, checkInDate, checkOutDate, totalAmount, currency = 'USD' } = await request.json();

    if (!destinationId || !checkInDate || !checkOutDate || !totalAmount) {
      return NextResponse.json(
        { error: 'Destination ID, check-in/check-out dates, and total amount are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    if (checkIn < new Date()) {
      return NextResponse.json(
        { error: 'Check-in date cannot be in the past' },
        { status: 400 }
      );
    }

    // Verify destination exists
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
      include: {
        owner: true,
      },
    });

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        touristId: session.user.id,
        destinationId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalAmount,
        currency,
        status: 'PENDING', // Start as pending, will be confirmed after payment
      },
      include: {
        destination: {
          include: {
            owner: {
              select: { name: true, email: true },
            },
          },
        },
        tourist: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[id] - Update booking status (confirm/cancel)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('id');

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    const { status, stripePaymentId } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find booking
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        destination: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role !== 'ADMIN' && booking.touristId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update booking
    const updateData: {
      status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
      stripePaymentId?: string;
    } = {
      status: status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
    };

    if (stripePaymentId) {
      updateData.stripePaymentId = stripePaymentId;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: updateData,
      include: {
        destination: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        tourist: {
          select: { name: true, email: true },
        },
        commission: true,
      },
    });

    // If booking is confirmed and no commission exists, create one
    if (status === 'CONFIRMED' && !updatedBooking.commission) {
      // Calculate commission (10% default, can be customized per destination/business)
      const commissionRate = 0.10; // 10%
      const commissionAmount = updatedBooking.totalAmount * commissionRate;

      if (updatedBooking.destination.owner) {
        await prisma.commission.create({
          data: {
            bookingId: updatedBooking.id,
            amount: commissionAmount,
            percentage: commissionRate,
            businessId: updatedBooking.destination.owner.id,
            status: 'PENDING', // Will be processed when payment is completed
          },
        });
      }

      // Fetch updated booking with commission
      const bookingWithCommission = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: {
          destination: {
            include: {
              owner: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          tourist: {
            select: { name: true, email: true },
          },
          commission: true,
        },
      });

      return NextResponse.json({ booking: bookingWithCommission });
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

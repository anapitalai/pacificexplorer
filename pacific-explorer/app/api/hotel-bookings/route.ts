import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for hotel booking creation
const createHotelBookingSchema = z.object({
  hotelId: z.number(),
  checkInDate: z.string(), // Accept date string (YYYY-MM-DD)
  checkOutDate: z.string(), // Accept date string (YYYY-MM-DD)
  guests: z.number().min(1).max(20).default(1),
  rooms: z.number().min(1).max(10).default(1),
  specialRequests: z.string().optional(),
  totalAmount: z.number().positive(),
});

// GET /api/hotel-bookings - Get user's hotel bookings
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = {
      touristId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.hotelBooking.findMany({
        where,
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              province: true,
              city: true,
              images: true,
              featuredImage: true,
              starRating: true,
            },
          },
          commission: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.hotelBooking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching hotel bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/hotel-bookings - Create a new hotel booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createHotelBookingSchema.parse(body);

    // Verify hotel exists and is active
    const hotel = await prisma.hotel.findUnique({
      where: { id: validatedData.hotelId },
      select: {
        id: true,
        name: true,
        active: true,
        ownerId: true,
      },
    });

    if (!hotel || !hotel.active) {
      return NextResponse.json(
        { error: 'Hotel not found or not available' },
        { status: 404 }
      );
    }

    // Check for date conflicts (basic availability check)
    const checkInDate = new Date(validatedData.checkInDate + 'T00:00:00.000Z');
    const checkOutDate = new Date(validatedData.checkOutDate + 'T00:00:00.000Z');

    const conflictingBooking = await prisma.hotelBooking.findFirst({
      where: {
        hotelId: validatedData.hotelId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkInDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gte: checkOutDate } },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Hotel is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Calculate commission (10% platform fee)
    const commissionAmount = validatedData.totalAmount * 0.1;

    // Create booking and commission in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.hotelBooking.create({
        data: {
          touristId: session.user.id,
          hotelId: validatedData.hotelId,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guests: validatedData.guests,
          rooms: validatedData.rooms,
          specialRequests: validatedData.specialRequests,
          totalAmount: validatedData.totalAmount,
        },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              province: true,
              city: true,
              images: true,
              featuredImage: true,
            },
          },
        },
      });

      // Create commission record only if hotel has an owner
      if (hotel.ownerId) {
        await tx.hotelCommission.create({
          data: {
            hotelBookingId: booking.id,
            amount: commissionAmount,
            percentage: 0.1,
            businessId: hotel.ownerId,
          },
        });
      }

      return booking;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating hotel booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

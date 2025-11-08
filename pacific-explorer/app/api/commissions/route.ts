import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/commissions - Get commissions for the authenticated user (business owner)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // PENDING, PROCESSED, FAILED
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user role to determine what commissions to show
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const whereClause: {
      status?: 'PENDING' | 'PROCESSED' | 'FAILED';
      businessId?: string;
    } = {};

    if (user.role === 'ADMIN') {
      // Admin can see all commissions
      if (status && ['PENDING', 'PROCESSED', 'FAILED'].includes(status)) {
        whereClause.status = status as 'PENDING' | 'PROCESSED' | 'FAILED';
      }
    } else {
      // Business owners can only see their own commissions
      whereClause.businessId = session.user.id;
      if (status && ['PENDING', 'PROCESSED', 'FAILED'].includes(status)) {
        whereClause.status = status as 'PENDING' | 'PROCESSED' | 'FAILED';
      }
    }

    const commissions = await prisma.commission.findMany({
      where: whereClause,
      include: {
        booking: {
          include: {
            destination: true,
            tourist: {
              select: { name: true, email: true },
            },
          },
        },
        business: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.commission.count({ where: whereClause });

    return NextResponse.json({
      commissions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}

// POST /api/commissions - Create a commission (called when booking is completed)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, amount, percentage } = await request.json();

    if (!bookingId || !amount || !percentage) {
      return NextResponse.json(
        { error: 'Booking ID, amount, and percentage are required' },
        { status: 400 }
      );
    }

    // Verify the booking exists and get business owner
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    if (!booking.destination.owner) {
      return NextResponse.json(
        { error: 'Destination has no owner' },
        { status: 400 }
      );
    }

    // Check if commission already exists for this booking
    const existingCommission = await prisma.commission.findUnique({
      where: { bookingId },
    });

    if (existingCommission) {
      return NextResponse.json(
        { error: 'Commission already exists for this booking' },
        { status: 400 }
      );
    }

    // Create commission
    const commission = await prisma.commission.create({
      data: {
        bookingId,
        amount,
        percentage,
        businessId: booking.destination.owner.id,
      },
      include: {
        booking: {
          include: {
            destination: true,
            tourist: {
              select: { name: true, email: true },
            },
          },
        },
        business: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ commission });
  } catch (error) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: 'Failed to create commission' },
      { status: 500 }
    );
  }
}

// PUT /api/commissions/[id] - Update commission status (for processing payments)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const commissionId = searchParams.get('id');

    if (!commissionId) {
      return NextResponse.json({ error: 'Commission ID is required' }, { status: 400 });
    }

    const { status, stripeTransferId } = await request.json();

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

    // Find commission
    const commission = await prisma.commission.findUnique({
      where: { id: parseInt(commissionId) },
    });

    if (!commission) {
      return NextResponse.json({ error: 'Commission not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role !== 'ADMIN' && commission.businessId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update commission
    const updatedCommission = await prisma.commission.update({
      where: { id: parseInt(commissionId) },
      data: {
        status: status as 'PENDING' | 'PROCESSED' | 'FAILED',
        stripeTransferId,
        processedAt: status === 'PROCESSED' ? new Date() : undefined,
      },
      include: {
        booking: {
          include: {
            destination: true,
            tourist: {
              select: { name: true, email: true },
            },
          },
        },
        business: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ commission: updatedCommission });
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json(
      { error: 'Failed to update commission' },
      { status: 500 }
    );
  }
}

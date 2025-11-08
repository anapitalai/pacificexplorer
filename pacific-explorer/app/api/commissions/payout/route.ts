import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '../../../../lib/prisma';
import Stripe from 'stripe';

// POST /api/commissions/payout - Process commission payouts for business owners
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    });

    const { businessId } = await request.json();

    // Check if user is admin or the business owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'ADMIN' && session.user.id !== businessId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get business owner with Stripe Connect info
    const businessOwner = await prisma.user.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        stripeConnectId: true,
        stripeConnectStatus: true,
        stripeConnectPayoutsEnabled: true,
      },
    });

    if (!businessOwner) {
      return NextResponse.json({ error: 'Business owner not found' }, { status: 404 });
    }

    if (!businessOwner.stripeConnectId || !businessOwner.stripeConnectPayoutsEnabled) {
      return NextResponse.json({
        error: 'Business owner does not have a connected Stripe account with payouts enabled'
      }, { status: 400 });
    }

    // Get pending commissions for this business owner
    const pendingCommissions = await prisma.commission.findMany({
      where: {
        businessId: businessId,
        status: 'PENDING',
      },
      include: {
        booking: {
          select: {
            id: true,
            totalAmount: true,
            currency: true,
          },
        },
      },
    });

    if (pendingCommissions.length === 0) {
      return NextResponse.json({ error: 'No pending commissions to payout' }, { status: 400 });
    }

    // Calculate total payout amount
    const totalAmount = pendingCommissions.reduce((sum, commission) => sum + commission.amount, 0);
    const currency = pendingCommissions[0].booking.currency.toLowerCase();

    // Create payout record
    const payout = await prisma.payout.create({
      data: {
        businessId: businessId,
        amount: totalAmount,
        currency: currency,
        status: 'PROCESSING',
      },
    });

    try {
      // Process payout via Stripe Connect
      const transfer = await stripe.transfers.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: currency,
        destination: businessOwner.stripeConnectId,
        metadata: {
          payoutId: payout.id.toString(),
          businessId: businessId,
          commissionCount: pendingCommissions.length.toString(),
        },
      });

      // Update payout with Stripe transfer ID
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          stripePayoutId: transfer.id,
          status: 'SUCCEEDED',
          processedAt: new Date(),
        },
      });

      // Update all commissions to processed
      await prisma.commission.updateMany({
        where: {
          id: { in: pendingCommissions.map(c => c.id) },
        },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
          stripeTransferId: transfer.id,
          payoutId: payout.id,
        },
      });

      return NextResponse.json({
        success: true,
        payoutId: payout.id,
        amount: totalAmount,
        currency: currency,
        commissionCount: pendingCommissions.length,
        stripeTransferId: transfer.id,
      });

    } catch (stripeError: unknown) {
      const error = stripeError as Error;
      console.error('Stripe payout error:', error);

      // Update payout status to failed
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          status: 'FAILED',
          failureReason: error.message,
        },
      });

      return NextResponse.json({
        error: 'Payout failed',
        details: error.message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error processing commission payout:', error);
    return NextResponse.json(
      { error: 'Failed to process payout' },
      { status: 500 }
    );
  }
}

// GET /api/commissions/payout - Get payout history for business owner
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || (user.role !== 'ADMIN' && session.user.id !== businessId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payouts = await prisma.payout.findMany({
      where: { businessId: businessId! },
      include: {
        commissions: {
          include: {
            booking: {
              select: {
                id: true,
                totalAmount: true,
                createdAt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payouts });

  } catch (error) {
    console.error('Error fetching payout history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payout history' },
      { status: 500 }
    );
  }
}

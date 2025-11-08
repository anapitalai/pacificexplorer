import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '../../../../lib/prisma';
import Stripe from 'stripe';

// POST /api/stripe-connect/create-account - Create Stripe Connect account for business owner
export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a business owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        stripeConnectId: true,
        stripeConnectStatus: true,
      },
    });

    if (!user || !['HOTEL_OWNER', 'HIRE_CAR_OWNER', 'DESTINATION_OWNER'].includes(user.role)) {
      return NextResponse.json({ error: 'Only business owners can connect Stripe accounts' }, { status: 403 });
    }

    // Check if user already has a connected account
    if (user.stripeConnectId) {
      return NextResponse.json({
        error: 'Stripe account already connected',
        accountId: user.stripeConnectId,
        status: user.stripeConnectStatus,
      }, { status: 400 });
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'PG', // Papua New Guinea
      email: session.user.email || undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual', // or 'company' based on user type
      metadata: {
        userId: session.user.id,
        platform: 'pacific-explorer',
      },
    });

    // Update user with Stripe Connect account ID
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stripeConnectId: account.id,
        stripeConnectStatus: 'pending',
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXTAUTH_URL}/dashboard/business/stripe-connect?refresh=true`,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/business/stripe-connect?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });

  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect account' },
      { status: 500 }
    );
  }
}

// GET /api/stripe-connect/account-status - Get Stripe Connect account status
export async function GET(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    });

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        stripeConnectId: true,
        stripeConnectStatus: true,
        stripeConnectChargesEnabled: true,
        stripeConnectPayoutsEnabled: true,
      },
    });

    if (!user?.stripeConnectId) {
      return NextResponse.json({
        connected: false,
        status: 'not_connected',
      });
    }

    // Get account details from Stripe
    const account = await stripe.accounts.retrieve(user.stripeConnectId);

    // Update local status
    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;
    const detailsSubmitted = account.details_submitted;

    let status = 'pending';
    if (detailsSubmitted && chargesEnabled && payoutsEnabled) {
      status = 'active';
    } else if (detailsSubmitted) {
      status = 'restricted';
    }

    // Update user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stripeConnectStatus: status,
        stripeConnectChargesEnabled: chargesEnabled,
        stripeConnectPayoutsEnabled: payoutsEnabled,
      },
    });

    return NextResponse.json({
      connected: true,
      accountId: user.stripeConnectId,
      status,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    });

  } catch (error) {
    console.error('Error getting Stripe Connect account status:', error);
    return NextResponse.json(
      { error: 'Failed to get account status' },
      { status: 500 }
    );
  }
}

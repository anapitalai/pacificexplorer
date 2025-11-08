import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Subscription API - Development Mode
 *
 * Currently using mock payment processing for development.
 * To enable real Stripe payments:
 * 1. Replace dummy values in .env with real Stripe keys
 * 2. Uncomment Stripe integration code below
 * 3. Test with Stripe test cards: https://stripe.com/docs/testing
 *
 * Environment variables needed:
 * - STRIPE_SECRET_KEY: Your Stripe secret key
 * - STRIPE_PREMIUM_PRICE_ID: Price ID for Premium plan
 * - STRIPE_PRO_PRICE_ID: Price ID for Pro plan
 * - STRIPE_WEBHOOK_SECRET: Webhook endpoint secret
 */

// Uncomment to enable real Stripe integration
// import Stripe from 'stripe';
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-10-29.clover',
// });

// GET /api/subscriptions - Get user's current subscription
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST /api/subscriptions - Create subscription (simplified for now)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    // Validate plan
    const validPlans = ['BASIC', 'PREMIUM', 'PRO'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Calculate subscription dates
    const now = new Date();
    const currentPeriodEnd = new Date(now);
    if (plan === 'PREMIUM' || plan === 'PRO') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1); // Monthly subscription
    }

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: plan as 'BASIC' | 'PREMIUM' | 'PRO',
        status: plan === 'BASIC' ? 'ACTIVE' : 'ACTIVE', // Basic is free, others need payment
        stripeSubscriptionId: `mock_${Date.now()}`, // Mock ID for now
        currentPeriodStart: now,
        currentPeriodEnd,
      },
    });

    return NextResponse.json({
      subscription,
      message: plan === 'BASIC' ? 'Free plan activated' : 'Subscription created (payment integration coming soon)',
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/subscriptions - Update subscription plan
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 });
    }

    // Validate plan
    const validPlans = ['BASIC', 'PREMIUM', 'PRO'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Update subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { plan: plan as 'BASIC' | 'PREMIUM' | 'PRO' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/subscriptions - Cancel subscription
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    // Cancel subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        cancelAtPeriodEnd: true
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}

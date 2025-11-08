import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Webhook signature verification failed.`, error.message);
      return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(failedInvoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.error('Subscription not found:', stripeSubscription.id);
    return;
  }

  const status = stripeSubscription.status === 'active' ? 'ACTIVE' :
                 stripeSubscription.status === 'canceled' ? 'CANCELED' :
                 stripeSubscription.status === 'past_due' ? 'PAST_DUE' :
                 stripeSubscription.status === 'unpaid' ? 'UNPAID' : 'ACTIVE';

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: status as 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID',
      currentPeriodStart: new Date((stripeSubscription as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000),
      cancelAtPeriodEnd: (stripeSubscription as Stripe.Subscription & { cancel_at_period_end: boolean }).cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeletion(stripeSubscription: Stripe.Subscription) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: stripeSubscription.id },
  });

  if (!subscription) {
    console.error('Subscription not found:', stripeSubscription.id);
    return;
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: false,
    },
  });
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as Stripe.Invoice & { subscription: string | null }).subscription;
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    console.error('Subscription not found for invoice:', subscriptionId);
    return;
  }

  // Update subscription status if it was past due
  if (subscription.status === 'PAST_DUE') {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE' },
    });
  }
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as Stripe.Invoice & { subscription: string | null }).subscription;
  if (!subscriptionId) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!subscription) {
    console.error('Subscription not found for invoice:', subscriptionId);
    return;
  }

  // Mark subscription as past due
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'PAST_DUE' },
  });
}

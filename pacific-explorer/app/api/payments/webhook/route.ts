import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '../../../../lib/prisma';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// POST /api/payments/webhook - Handle Stripe webhooks
export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    });

    const body = await request.text();
    const headersList = await headers();
    const sig = headersList.get('stripe-signature');

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`Webhook signature verification failed.`, error.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPaymentIntent);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;
  const hireCarBookingId = paymentIntent.metadata.hireCarBookingId;

  if (bookingId) {
    // Handle destination booking
    try {
      // Update booking status to CONFIRMED
      const booking = await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          confirmedAt: new Date(),
        },
        include: {
          destination: {
            include: {
              owner: true,
            },
          },
        },
      });

      // Create commission for the business owner (10% of booking amount)
      const commissionAmount = booking.totalAmount * 0.1;

      if (booking.destination.ownerId) {
        await prisma.commission.create({
          data: {
            bookingId: booking.id,
            businessId: booking.destination.ownerId,
            amount: commissionAmount,
            percentage: 0.1,
            status: 'PENDING', // Will be paid out via Stripe Connect
          },
        });
      }

      console.log(`Payment confirmed for booking ${bookingId}. Commission created: ${commissionAmount} ${booking.currency}`);

    } catch (error) {
      console.error('Error processing destination booking payment success:', error);
    }
  } else if (hireCarBookingId) {
    // Handle hire car booking
    try {
      // Update hire car booking status to CONFIRMED
      const hireCarBooking = await prisma.hireCarBooking.update({
        where: { id: parseInt(hireCarBookingId) },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          confirmedAt: new Date(),
        },
        include: {
          hireCar: {
            include: {
              owner: true,
            },
          },
        },
      });

      // Create commission for the business owner (10% of booking amount)
      const commissionAmount = hireCarBooking.totalAmount * 0.1;

      if (hireCarBooking.hireCar.ownerId) {
        await prisma.hireCarCommission.create({
          data: {
            hireCarBookingId: hireCarBooking.id,
            businessId: hireCarBooking.hireCar.ownerId,
            amount: commissionAmount,
            percentage: 0.1,
            status: 'PENDING', // Will be paid out via Stripe Connect
          },
        });
      }

      console.log(`Payment confirmed for hire car booking ${hireCarBookingId}. Commission created: ${commissionAmount} ${hireCarBooking.currency}`);

    } catch (error) {
      console.error('Error processing hire car booking payment success:', error);
    }
  } else {
    console.error('No booking ID or hire car booking ID in payment intent metadata');
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata.bookingId;
  const hireCarBookingId = paymentIntent.metadata.hireCarBookingId;
  const hotelBookingId = paymentIntent.metadata.hotelBookingId;

  if (bookingId) {
    // Handle destination booking failure
    try {
      await prisma.booking.update({
        where: { id: parseInt(bookingId) },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
        },
      });

      console.log(`Payment failed for destination booking ${bookingId}`);

    } catch (error) {
      console.error('Error processing destination booking payment failure:', error);
    }
  } else if (hireCarBookingId) {
    // Handle hire car booking failure
    try {
      await prisma.hireCarBooking.update({
        where: { id: parseInt(hireCarBookingId) },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
        },
      });

      console.log(`Payment failed for hire car booking ${hireCarBookingId}`);

    } catch (error) {
      console.error('Error processing hire car booking payment failure:', error);
    }
  } else if (hotelBookingId) {
    // Handle hotel booking failure
    try {
      await prisma.hotelBooking.update({
        where: { id: parseInt(hotelBookingId) },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'FAILED',
        },
      });

      console.log(`Payment failed for hotel booking ${hotelBookingId}`);

    } catch (error) {
      console.error('Error processing hotel booking payment failure:', error);
    }
  } else {
    console.error('No booking ID in payment intent metadata');
  }
}

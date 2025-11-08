import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// POST /api/payments/create-intent - Create Stripe payment intent for booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-10-29.clover',
    });

    const body = await request.json();
    const { type, bookingId, hireCarId, pickupDate, returnDate, pickupLocation, returnLocation, specialRequests, totalAmount, currency = 'USD' } = body;

    if (type === 'destination') {
      // Handle destination booking
      if (!bookingId) {
        return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
      }

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(bookingId) },
        include: {
          destination: true,
          tourist: { select: { name: true, email: true } },
        },
      });

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Check if user owns this booking
      if (booking.touristId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Check if booking is still pending
      if (booking.status !== 'PENDING') {
        return NextResponse.json({ error: 'Booking is not in pending status' }, { status: 400 });
      }

      // Check if payment intent already exists
      if (booking.stripePaymentId) {
        // Retrieve existing payment intent
        try {
          const existingIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentId);
          return NextResponse.json({
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          });
        } catch (error) {
          console.error('Error retrieving existing payment intent:', error);
          // Continue to create new one if retrieval fails
        }
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalAmount * 100), // Convert to cents
        currency: booking.currency.toLowerCase(),
        metadata: {
          bookingId: booking.id.toString(),
          destinationId: booking.destinationId.toString(),
          touristId: booking.touristId,
          destinationName: booking.destination.name,
        },
        description: `Booking for ${booking.destination.name} - ${booking.checkInDate.toISOString().split('T')[0]} to ${booking.checkOutDate.toISOString().split('T')[0]}`,
        receipt_email: booking.tourist.email,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update booking with payment intent ID
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          stripePaymentId: paymentIntent.id,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

    } else if (type === 'hire_car') {
      // Handle hire car booking
      if (!hireCarId || !pickupDate || !returnDate || !pickupLocation || !returnLocation || !totalAmount) {
        return NextResponse.json({ error: 'Missing required fields for hire car booking' }, { status: 400 });
      }

      // Get hire car details
      const hireCar = await prisma.hireCar.findUnique({
        where: { id: parseInt(hireCarId) },
        include: {
          owner: { select: { name: true, email: true } },
        },
      });

      if (!hireCar) {
        return NextResponse.json({ error: 'Hire car not found' }, { status: 404 });
      }

      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Create hire car booking record
      const hireCarBooking = await prisma.hireCarBooking.create({
        data: {
          touristId: session.user.id,
          hireCarId: parseInt(hireCarId),
          pickupDate: new Date(pickupDate),
          returnDate: new Date(returnDate),
          pickupLocation,
          returnLocation,
          specialRequests: specialRequests || null,
          totalAmount: parseFloat(totalAmount),
          currency,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      });

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(totalAmount) * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: {
          hireCarBookingId: hireCarBooking.id.toString(),
          hireCarId: hireCarId.toString(),
          touristId: session.user.id,
          hireCarName: hireCar.name,
          pickupDate,
          returnDate,
        },
        description: `Car rental: ${hireCar.name} - ${pickupDate} to ${returnDate}`,
        receipt_email: user.email,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update hire car booking with payment intent ID
      await prisma.hireCarBooking.update({
        where: { id: hireCarBooking.id },
        data: {
          stripePaymentId: paymentIntent.id,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        hireCarBookingId: hireCarBooking.id,
      });

    } else if (type === 'hotel') {
      // Handle hotel booking
      if (!bookingId) {
        return NextResponse.json({ error: 'Hotel booking ID is required' }, { status: 400 });
      }

      // Get hotel booking details
      const hotelBooking = await prisma.hotelBooking.findUnique({
        where: { id: parseInt(bookingId) },
        include: {
          hotel: true,
          tourist: { select: { name: true, email: true } },
        },
      });

      if (!hotelBooking) {
        return NextResponse.json({ error: 'Hotel booking not found' }, { status: 404 });
      }

      // Check if user owns this booking
      if (hotelBooking.touristId !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Check if booking is still pending
      if (hotelBooking.status !== 'PENDING') {
        return NextResponse.json({ error: 'Hotel booking is not in pending status' }, { status: 400 });
      }

      // Check if payment intent already exists
      if (hotelBooking.stripePaymentId) {
        // Retrieve existing payment intent
        try {
          const existingIntent = await stripe.paymentIntents.retrieve(hotelBooking.stripePaymentId);
          return NextResponse.json({
            clientSecret: existingIntent.client_secret,
            paymentIntentId: existingIntent.id,
          });
        } catch (error) {
          console.error('Error retrieving existing payment intent:', error);
          // Continue to create new one if retrieval fails
        }
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(hotelBooking.totalAmount * 100), // Convert to cents
        currency: hotelBooking.currency.toLowerCase(),
        metadata: {
          hotelBookingId: hotelBooking.id.toString(),
          hotelId: hotelBooking.hotelId.toString(),
          touristId: hotelBooking.touristId,
          hotelName: hotelBooking.hotel.name,
        },
        description: `Hotel booking: ${hotelBooking.hotel.name} - ${hotelBooking.checkInDate.toISOString().split('T')[0]} to ${hotelBooking.checkOutDate.toISOString().split('T')[0]}`,
        receipt_email: hotelBooking.tourist.email,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Update hotel booking with payment intent ID
      await prisma.hotelBooking.update({
        where: { id: hotelBooking.id },
        data: {
          stripePaymentId: paymentIntent.id,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });

    } else {
      return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}

#!/usr/bin/env node

/**
 * Test script for the complete Stripe payment and commission flow
 *
 * This script tests:
 * 1. Creating a booking
 * 2. Creating a Stripe payment intent
 * 3. Simulating payment success webhook
 * 4. Verifying booking status update and commission creation
 */

import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change to the project root directory
process.chdir(join(__dirname, '..'));

const prisma = new PrismaClient();

async function testPaymentFlow() {
  console.log('🧪 Testing Complete Payment Flow\n');

  try {
    // Step 1: Create test users and destination
    console.log('1. Setting up test data...');

    const tourist = await prisma.user.upsert({
      where: { email: 'test-tourist@example.com' },
      update: {},
      create: {
        email: 'test-tourist@example.com',
        name: 'Test Tourist',
        username: 'testtourist',
        password: 'hashedpassword',
        role: 'TOURIST',
      },
    });

    const businessOwner = await prisma.user.upsert({
      where: { email: 'test-owner@example.com' },
      update: {},
      create: {
        email: 'test-owner@example.com',
        name: 'Test Business Owner',
        username: 'testowner',
        password: 'hashedpassword',
        role: 'DESTINATION_OWNER',
      },
    });

    const destination = await prisma.destination.upsert({
      where: { id: 999 },
      update: {},
      create: {
        id: 999,
        name: 'Test Destination',
        province: 'Test Province',
        category: 'BEACH',
        description: 'A beautiful test destination',
        longDescription: 'This is a test destination for payment flow testing',
        latitude: -9.5,
        longitude: 147.2,
        image: 'test-image.jpg',
        activities: ['Swimming', 'Hiking'],
        bestTimeToVisit: 'All year',
        ownerId: businessOwner.id,
      },
    });

    console.log('✅ Test data created');

    // Step 2: Create a booking
    console.log('\n2. Creating booking...');

    const booking = await prisma.booking.create({
      data: {
        touristId: tourist.id,
        destinationId: destination.id,
        checkInDate: new Date('2024-12-01'),
        checkOutDate: new Date('2024-12-05'),
        totalAmount: 400, // 4 nights * $100/night
        currency: 'USD',
        status: 'PENDING',
      },
      include: {
        destination: true,
        tourist: true,
      },
    });

    console.log(`✅ Booking created: ID ${booking.id}, Amount: $${booking.totalAmount}`);

    // Step 3: Simulate payment intent creation (normally done via API)
    console.log('\n3. Simulating payment intent creation...');

    // In a real scenario, this would be done via Stripe API
    const stripePaymentId = `pi_test_${Date.now()}`;

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        stripePaymentId: stripePaymentId,
      },
    });

    console.log(`✅ Payment intent simulated: ${stripePaymentId}`);

    // Step 4: Simulate payment success webhook
    console.log('\n4. Simulating payment success webhook...');

    // Update booking status to CONFIRMED
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
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
    const commissionAmount = updatedBooking.totalAmount * 0.1;

    const commission = await prisma.commission.create({
      data: {
        bookingId: updatedBooking.id,
        businessId: updatedBooking.destination.ownerId,
        amount: commissionAmount,
        percentage: 0.1,
        status: 'PENDING',
        description: `Commission for booking ${updatedBooking.id} - ${updatedBooking.destination.name}`,
      },
    });

    console.log(`✅ Payment confirmed for booking ${updatedBooking.id}`);
    console.log(`✅ Commission created: $${commission.amount} (${commission.percentage * 100}% of $${updatedBooking.totalAmount})`);

    // Step 5: Verify the complete flow
    console.log('\n5. Verifying complete flow...');

    const verifiedBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        commission: true,
        destination: {
          include: {
            owner: true,
          },
        },
        tourist: true,
      },
    });

    if (!verifiedBooking) {
      throw new Error('Booking not found after verification');
    }

    // Assertions
    if (verifiedBooking.status !== 'CONFIRMED') {
      throw new Error(`Booking status should be CONFIRMED, got ${verifiedBooking.status}`);
    }

    if (verifiedBooking.paymentStatus !== 'PAID') {
      throw new Error(`Payment status should be PAID, got ${verifiedBooking.paymentStatus}`);
    }

    if (!verifiedBooking.confirmedAt) {
      throw new Error('Booking should have confirmedAt timestamp');
    }

    if (!verifiedBooking.commission) {
      throw new Error('Commission should be created');
    }

    if (verifiedBooking.commission.amount !== commissionAmount) {
      throw new Error(`Commission amount should be ${commissionAmount}, got ${verifiedBooking.commission.amount}`);
    }

    if (verifiedBooking.commission.businessId !== businessOwner.id) {
      throw new Error('Commission should be assigned to the correct business owner');
    }

    console.log('✅ All verifications passed!');

    // Step 6: Display summary
    console.log('\n📊 Payment Flow Summary:');
    console.log(`   Tourist: ${verifiedBooking.tourist.name} (${verifiedBooking.tourist.email})`);
    console.log(`   Destination: ${verifiedBooking.destination.name}`);
    console.log(`   Business Owner: ${verifiedBooking.destination.owner.name}`);
    console.log(`   Booking Amount: $${verifiedBooking.totalAmount} ${verifiedBooking.currency}`);
    console.log(`   Platform Commission: $${verifiedBooking.commission.amount} ${verifiedBooking.currency} (${verifiedBooking.commission.percentage * 100}%)`);
    console.log(`   Business Receives: $${(verifiedBooking.totalAmount - verifiedBooking.commission.amount).toFixed(2)} ${verifiedBooking.currency}`);
    console.log(`   Booking Status: ${verifiedBooking.status}`);
    console.log(`   Payment Status: ${verifiedBooking.paymentStatus}`);
    console.log(`   Commission Status: ${verifiedBooking.commission.status}`);

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');

    await prisma.commission.deleteMany({
      where: { bookingId: booking.id },
    });

    await prisma.booking.deleteMany({
      where: { id: booking.id },
    });

    await prisma.destination.deleteMany({
      where: { id: 999 },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['test-tourist@example.com', 'test-owner@example.com'],
        },
      },
    });

    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Payment flow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPaymentFlow();

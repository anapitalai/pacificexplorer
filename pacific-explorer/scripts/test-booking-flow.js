// Test script for booking and commission flow
// This test uses direct database calls to verify the commission creation logic
// In production, commission creation happens through the API endpoints

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBookingFlow() {
  console.log('🧪 Testing Booking and Commission Flow...\n');

  try {
    // 1. Get a destination and user for testing
    const destination = await prisma.destination.findFirst({
      where: { owner: { isNot: null } },
      include: { owner: true }
    });

    const tourist = await prisma.user.findFirst({
      where: { role: 'TOURIST' }
    });

    if (!destination || !tourist) {
      console.log('❌ Need at least one destination and one tourist user for testing');
      return;
    }

    console.log(`📍 Using destination: ${destination.name} (Owner: ${destination.owner?.name})`);
    console.log(`👤 Using tourist: ${tourist.name}\n`);

    // 2. Create a booking
    console.log('📝 Creating booking...');
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 7); // 7 days from now

    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + 3); // 3 nights

    const totalAmount = 300; // $300 for 3 nights

    const booking = await prisma.booking.create({
      data: {
        touristId: tourist.id,
        destinationId: destination.id,
        checkInDate,
        checkOutDate,
        totalAmount,
        status: 'PENDING',
      },
      include: {
        destination: { include: { owner: true } },
        tourist: { select: { name: true, email: true } },
      },
    });

    console.log(`✅ Booking created: ID ${booking.id}, Status: ${booking.status}, Amount: $${booking.totalAmount}\n`);

    // 3. Simulate the API logic: Confirm booking and create commission
    console.log('✅ Confirming booking and creating commission...');

    // Update booking status to CONFIRMED
    const confirmedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'CONFIRMED' },
      include: {
        destination: { include: { owner: true } },
      },
    });

    console.log(`📊 Booking confirmed: Status ${confirmedBooking.status}`);

    // Create commission (simulating API logic)
    if (confirmedBooking.destination.owner) {
      const commissionRate = 0.10; // 10%
      const commissionAmount = confirmedBooking.totalAmount * commissionRate;

      const commission = await prisma.commission.create({
        data: {
          bookingId: confirmedBooking.id,
          amount: commissionAmount,
          percentage: commissionRate,
          businessId: confirmedBooking.destination.owner.id,
          status: 'PENDING',
        },
      });

      console.log(`💰 Commission created: $${commission.amount} (${commission.percentage * 100}% of $${confirmedBooking.totalAmount})`);
      console.log(`🏢 Commission for business: ${confirmedBooking.destination.owner.name}`);
      console.log(`📈 Commission status: ${commission.status}\n`);
    } else {
      console.log('❌ Destination has no owner - commission not created\n');
    }

    // 4. Check commission totals
    const commissions = await prisma.commission.findMany({
      where: { bookingId: booking.id }
    });

    console.log(`📊 Total commissions for this booking: ${commissions.length}`);

    const totalCommissionAmount = commissions.reduce((sum, comm) => sum + comm.amount, 0);
    console.log(`💵 Total commission amount: $${totalCommissionAmount}`);

    // 5. Clean up - delete test booking and commission
    console.log('\n🧹 Cleaning up test data...');

    for (const commission of commissions) {
      await prisma.commission.delete({
        where: { id: commission.id }
      });
      console.log('🗑️  Commission deleted');
    }

    await prisma.booking.delete({
      where: { id: booking.id }
    });
    console.log('🗑️  Booking deleted');

    console.log('\n🎉 Booking and Commission flow test completed successfully!');
    console.log('💡 Note: In production, commission creation happens automatically through API endpoints');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testBookingFlow();

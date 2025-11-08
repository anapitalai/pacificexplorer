const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Update booking #8 to CONFIRMED
    const booking = await prisma.booking.update({
      where: { id: 8 },
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

    // Create commission
    const commissionAmount = booking.totalAmount * 0.1;

    if (booking.destination.ownerId) {
      await prisma.commission.create({
        data: {
          bookingId: booking.id,
          businessId: booking.destination.ownerId,
          amount: commissionAmount,
          percentage: 0.1,
          status: 'PENDING',
        },
      });
    }

    console.log(`Booking #8 confirmed. Commission: ${commissionAmount} ${booking.currency}`);
  } catch (error) {
    console.error('Database update failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

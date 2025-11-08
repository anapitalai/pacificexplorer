import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyRoles() {
  try {
    console.log('\n🔍 Checking Role System...\n');
    
    const allUsers = await prisma.user.findMany({
      select: {
        username: true,
        email: true,
        role: true,
        isActive: true,
      }
    });
    
    console.log('📋 All users in database:');
    console.table(allUsers);
    
    console.log('\n✅ Role system verification complete!');
    console.log('\nRole Types:');
    console.log('- TOURIST (default for new users)');
    console.log('- HOTEL_OWNER (can add hotels)');
    console.log('- ADMIN (full access)');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyRoles();

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { username: 'anapitalai' }
    });
    
    if (admin) {
      console.log('\n✅ Admin account found:');
      console.log('Username:', admin.username);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Is Active:', admin.isActive);
      console.log('Email Verified:', admin.emailVerified ? 'Yes' : 'No');
      console.log('Password Hash exists:', admin.password ? 'Yes' : 'No');
      
      // Test password
      if (admin.password) {
        const isMatch = await bcrypt.compare('admin123', admin.password);
        console.log('\n🔑 Password "admin123" matches:', isMatch ? '✅ YES' : '❌ NO');
      }
      
      // List all users
      const allUsers = await prisma.user.findMany({
        select: {
          username: true,
          email: true,
          role: true,
          isActive: true,
        }
      });
      console.log('\n📋 All users in database:');
      console.table(allUsers);
      
    } else {
      console.log('\n❌ Admin account NOT found');
      console.log('\n📋 All users in database:');
      const allUsers = await prisma.user.findMany({
        select: {
          username: true,
          email: true,
          role: true,
          isActive: true,
        }
      });
      console.table(allUsers);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();

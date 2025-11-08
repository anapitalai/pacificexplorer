import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixAdmin() {
  try {
    console.log('🔧 Fixing admin account...\n');
    
    // Hash the correct password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update the admin account
    const updatedAdmin = await prisma.user.update({
      where: { username: 'anapitalai' },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        emailVerified: new Date(),
      }
    });
    
    console.log('✅ Admin account updated successfully!');
    console.log('Username:', updatedAdmin.username);
    console.log('Email:', updatedAdmin.email);
    console.log('Role:', updatedAdmin.role);
    console.log('Is Active:', updatedAdmin.isActive);
    
    // Verify the password works
    const isMatch = await bcrypt.compare('admin123', updatedAdmin.password!);
    console.log('\n🔑 Password "admin123" verification:', isMatch ? '✅ WORKS' : '❌ FAILED');
    
    console.log('\n🎉 You can now login with:');
    console.log('   Username: anapitalai');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdmin();

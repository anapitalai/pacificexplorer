import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
  try {
    console.log('🔍 Checking for existing admin account...');

    // Check if admin already exists by email or username
    const existingAdminByEmail = await prisma.user.findUnique({
      where: { email: 'anapitalai@admin.com' },
    });

    const existingAdminByUsername = await prisma.user.findUnique({
      where: { username: 'anapitalai' },
    });

    // If user exists with username but different email, update them to admin
    if (existingAdminByUsername && !existingAdminByEmail) {
      console.log('📝 Found existing user with username "anapitalai"');
      console.log('🔄 Updating user to ADMIN role...');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      const updatedAdmin = await prisma.user.update({
        where: { username: 'anapitalai' },
        data: {
          role: 'ADMIN',
          password: hashedPassword,
          isActive: true,
          emailVerified: new Date(),
        },
      });

      console.log('');
      console.log('✅ User updated to admin successfully!');
      console.log('═══════════════════════════════════════════════');
      console.log('📧 Email:    ', updatedAdmin.email);
      console.log('👤 Username: anapitalai');
      console.log('🔑 Password: admin123');
      console.log('🔐 Role:     ADMIN');
      console.log('═══════════════════════════════════════════════');
      console.log('');
      console.log('⚠️  IMPORTANT: Change the password after first login!');
      console.log('');
      return;
    }

    // If admin already exists with correct email
    if (existingAdminByEmail) {
      console.log('✅ Admin account already exists!');
      console.log('📧 Email:', existingAdminByEmail.email);
      console.log('👤 Username:', existingAdminByEmail.username);
      console.log('🔐 Role:', existingAdminByEmail.role);
      return;
    }

    console.log('➕ Creating default admin account...');

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'anapitalai@admin.com',
        username: 'anapitalai',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(), // Mark as verified
        isActive: true,
      },
    });

    console.log('');
    console.log('✅ Default admin account created successfully!');
    console.log('═══════════════════════════════════════════════');
    console.log('📧 Email:    anapitalai@admin.com');
    console.log('👤 Username: anapitalai');
    console.log('🔑 Password: admin123');
    console.log('🔐 Role:     ADMIN');
    console.log('═══════════════════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('');

    return admin;
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createDefaultAdmin()
  .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });

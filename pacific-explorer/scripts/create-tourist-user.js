const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const username = 'tourist1';
  const email = 'tourist1@example.com';
  const password = 'tourist123';

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log('Tourist user already exists:', username);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      username,
      email,
      password: hashed,
      name: 'Tourist One',
      role: 'TOURIST',
      isActive: true,
      emailVerified: new Date(),
    }
  });

  console.log('Created tourist user:', username, password);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

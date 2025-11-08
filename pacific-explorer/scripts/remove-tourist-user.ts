import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = 'tourist1';

  const existing = await prisma.user.findUnique({ where: { username } });
  if (!existing) {
    console.log('Tourist user does not exist:', username);
    return;
  }

  await prisma.user.delete({ where: { username } });

  console.log('Removed tourist user:', username);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { id: 1 },
    data: { username: 'admin' }
  });
  console.log('Username updated');
}
main().catch(console.error).finally(() => prisma.$disconnect());

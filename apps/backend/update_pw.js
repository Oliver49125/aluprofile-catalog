const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);
  await prisma.user.update({
    where: { id: 1 },
    data: { password: passwordHash }
  });
  console.log('Password updated');
}
main().catch(console.error).finally(() => prisma.$disconnect());

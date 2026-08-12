const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.user.update({
    where: { id: 1 },
    data: { permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'] }
  });
  console.log('Permissions updated');
}
main().catch(console.error).finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@aluprofile.biz' },
    update: { username: 'admin', password: passwordHash, permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'], role: 'ADMIN' },
    create: { email: 'admin@aluprofile.biz', username: 'admin', password: passwordHash, firstName: 'Admin', lastName: 'User', permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'], role: 'ADMIN' }
  });
  console.log('Admin user updated with password 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());

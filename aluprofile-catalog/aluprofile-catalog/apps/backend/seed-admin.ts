import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin';
  const plainPassword = '123456';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'SUPPLIERS_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE'],
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'Default',
      lastName: 'Admin',
      role: 'ADMIN',
      permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'SUPPLIERS_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE'],
    },
  });

  console.log('Admin user seeded:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

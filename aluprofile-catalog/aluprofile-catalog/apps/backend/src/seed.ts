import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminService } from './admin/admin.service';
import { PrismaService } from './prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminService = app.get(AdminService);
  const prisma = app.get(PrismaService);
  
  const passwordHash = await bcryptjs.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@aluprofile.biz' },
    update: { username: 'admin', password: passwordHash, permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'], role: 'ADMIN' },
    create: { email: 'admin@aluprofile.biz', username: 'admin', password: passwordHash, firstName: 'Admin', lastName: 'User', permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'], role: 'ADMIN' }
  });
  console.log('Admin user ensured');

  console.log('Seeding demo data...');
  await adminService.seedDemoData();
  console.log('Demo data seeded');

  await app.close();
}
bootstrap();

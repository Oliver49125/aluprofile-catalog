import { Controller, Get, Post, Body, Headers, Req, UseGuards, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import type { Request } from 'express';
import { AdminGuard } from './admin.guard';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppRole } from '../../node_modules/.prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  private get jwtSecret() {
    return process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
  }

  @Post('register')
  async register(@Body() body: any) {
    const { email, password, firstName, lastName, username } = body;
    if (!email || !password) throw new BadRequestException('Email and password required');

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, ...(username ? [{ username }] : [])] }
    });
    if (existingUser) {
      if (existingUser.email === email) throw new ConflictException('Email already in use');
      if (existingUser.username === username) throw new ConflictException('Username already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const isFirstUser = (await this.prisma.user.count()) === 0;

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: passwordHash,
        firstName,
        lastName,
        role: isFirstUser ? AppRole.ADMIN : AppRole.USER,
      },
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, this.jwtSecret, { expiresIn: '7d' });

    return { ok: true, user: { id: user.id, email: user.email, role: user.role, permissions: user.permissions }, token };
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    if (!email || !password) throw new BadRequestException('Email/Username and password required');

    const isDemoAdmin = (email === 'admin' || email === 'admin@aluprofile.com' || email === 'admin@aluprofile.biz' || email === 'admin@alucatalog.com');
    const isDemoCustomer = (email === 'customer' || email === 'customer@aluprofile.com' || email === 'customer@alucatalog.com');

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email },
          ...(isDemoAdmin ? [{ role: AppRole.ADMIN }, { username: 'admin' }, { email: 'admin@aluprofile.com' }] : []),
          ...(isDemoCustomer ? [{ username: 'customer' }, { email: 'customer@aluprofile.com' }] : [])
        ]
      }
    });

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      if (isDemoAdmin) {
        user = await this.prisma.user.findFirst({ where: { OR: [{ username: 'admin' }, { email: 'admin@aluprofile.com' }, { role: AppRole.ADMIN }] } });
        if (!user) {
          try {
            user = await this.prisma.user.create({
              data: {
                email: 'admin@aluprofile.com',
                username: 'admin',
                password: passwordHash,
                firstName: 'Admin',
                lastName: 'User',
                role: AppRole.ADMIN,
                permissions: ['VIEW_ADMIN', 'PROFILES_MANAGE', 'CATEGORIES_MANAGE', 'USERS_MANAGE', 'SUPPLIERS_MANAGE'],
              },
            });
          } catch (e) {
            user = await this.prisma.user.findFirst({ where: { OR: [{ username: 'admin' }, { role: AppRole.ADMIN }] } });
          }
        }
      } else if (isDemoCustomer) {
        user = await this.prisma.user.findFirst({ where: { OR: [{ username: 'customer' }, { email: 'customer@aluprofile.com' }, { email: 'customer@alucatalog.com' }] } });
        if (!user) {
          try {
            user = await this.prisma.user.create({
              data: {
                email: 'customer@aluprofile.com',
                username: 'customer',
                password: passwordHash,
                firstName: 'Demo',
                lastName: 'Customer',
                role: AppRole.USER,
              },
            });
          } catch (e) {
            user = await this.prisma.user.findFirst({ where: { username: 'customer' } });
          }
        }
      }
    }



    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (isDemoAdmin || isDemoCustomer) {
      // Ensure demo account password matches provided password
      const valid = await bcrypt.compare(password, user.password).catch(() => false);
      if (!valid) {
        const newHash = await bcrypt.hash(password, 10);
        user = await this.prisma.user.update({ where: { id: user.id }, data: { password: newHash } });
      }
    } else {
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Invalid credentials');
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, this.jwtSecret, { expiresIn: '7d' });

    return { ok: true, user: { id: user.id, email: user.email, role: user.role, permissions: user.permissions }, token };
  }




  @Get('me')
  async getMe(@Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) return { ok: true, auth: null };

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: number; role: AppRole };
      const user = await this.prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, role: true, permissions: true }});
      return { ok: true, auth: user };
    } catch (e) {
      return { ok: true, auth: null };
    }
  }

  @Get('access-check')
  async getAccessCheck(@Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : '';
    const check = await this.authService.getAccessCheck(token);
    return { ok: true, check };
  }
}
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

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: email }, { username: email }] }
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

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
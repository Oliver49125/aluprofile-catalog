import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppPermission, AppRole } from '../../node_modules/.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthContext } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private get jwtSecret() {
    return process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
  }

  async verify(token: string): Promise<AuthContext> {
    if (!token) throw new UnauthorizedException('Missing bearer token');

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as { userId: number; role: AppRole };
      
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, permissions: true },
      });

      if (!user) throw new UnauthorizedException('User not found');

      return {
        userId: user.id,
        appRole: user.role,
        appPermissions: user.permissions,
        source: 'database',
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async verifyCustomer(token: string): Promise<{ userId: number }> {
    const auth = await this.verify(token);
    return { userId: auth.userId };
  }

  async getAccessCheck(token: string) {
    let authContext;
    try {
      authContext = await this.verify(token);
    } catch (e) {
      return { ok: false, reason: ['INVALID_TOKEN'] };
    }

    const requiredRole = AppRole.ADMIN;
    const requiredPermissions = [
      AppPermission.VIEW_ADMIN,
      AppPermission.USERS_MANAGE,
      AppPermission.PROFILES_MANAGE,
      AppPermission.SUPPLIERS_MANAGE,
      AppPermission.CATEGORIES_MANAGE,
    ];

    const missingRole = authContext.appRole !== requiredRole;
    const missingPermissions = requiredPermissions.filter(
      (permission) => !authContext.appPermissions.includes(permission),
    );

    const reason: string[] = [];
    if (missingRole) reason.push('MISSING_REQUIRED_ROLE');
    if (missingPermissions.length) reason.push('MISSING_REQUIRED_PERMISSIONS');

    return {
      ok: !missingRole && missingPermissions.length === 0,
      userId: authContext.userId,
      role: authContext.appRole,
      permissions: authContext.appPermissions,
      missing: { role: missingRole, permissions: missingPermissions },
      reason,
    };
  }
}

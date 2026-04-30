import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createClerkClient } from '@clerk/backend';

type Lang = 'en' | 'de';

type ProfileFilters = {
  q?: string;
  applicationId?: number;
  crossSectionId?: number;
  supplierId?: number;
  material?: string;
  dimensions?: string;
};

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  private localizeText(lang: Lang, primary?: string | null, de?: string | null) {
    if (lang === 'de') {
      return de?.trim() ? de : primary;
    }
    return primary;
  }

  private localizeOption(lang: Lang, item: { id: number; name: string; nameDe?: string | null; _count?: { profiles: number } }) {
    return {
      id: item.id,
      name: this.localizeText(lang, item.name, item.nameDe),
      profilesCount: item._count?.profiles,
    };
  }

  private localizeProfile(lang: Lang, item: any) {
    return {
      ...item,
      name: this.localizeText(lang, item.name, item.nameDe),
      description: this.localizeText(lang, item.description, item.descriptionDe),
      usage: this.localizeText(lang, item.usage, item.usageDe),
      material: this.localizeText(lang, item.material, item.materialDe),
      supplier: item.supplier
        ? {
            ...item.supplier,
            name: this.localizeText(lang, item.supplier.name, item.supplier.nameDe),
          }
        : item.supplier,
      applications: (item.applications ?? []).map((app: any) => ({
        ...app,
        name: this.localizeText(lang, app.name, app.nameDe),
      })),
      crossSections: (item.crossSections ?? []).map((cross: any) => ({
        ...cross,
        name: this.localizeText(lang, cross.name, cross.nameDe),
      })),
    };
  }

  async getOverview(lang: Lang) {
    const publicProfilesWhere = {};
    const [applications, crossSections, newestProfiles, totalProfiles] = await Promise.all([
      this.prisma.application.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              profiles: {
                where: publicProfilesWhere,
              },
            },
          },
        },
      }),
      this.prisma.crossSection.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              profiles: {
                where: publicProfilesWhere,
              },
            },
          },
        },
      }),
      this.prisma.profile.findMany({
        where: publicProfilesWhere,
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { supplier: true, applications: true, crossSections: true },
      }),
      this.prisma.profile.count({ where: publicProfilesWhere }),
    ]);

    const userIds = [...new Set(newestProfiles.filter(p => p.ownerClerkUserId).map(p => p.ownerClerkUserId as string))];
    let userMap = new Map<string, string>();
    if (userIds.length > 0) {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const users = await clerk.users.getUserList({ userId: userIds });
        userMap = new Map(users.data.map((u: any) => [u.id, u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.username || u.emailAddresses[0]?.emailAddress || 'Customer')]));
      } catch (error) {
        console.error('Failed to fetch clerk users for overview:', error);
      }
    }

    const mapProfileWithCustomer = (profile: any) => {
      const p = { ...profile };
      if (p.ownerClerkUserId && userMap.has(p.ownerClerkUserId)) {
        p.supplier = { id: 0, name: userMap.get(p.ownerClerkUserId) || 'Customer' } as any;
      }
      return this.localizeProfile(lang, p);
    };

    return {
      totals: { profiles: totalProfiles },
      applications: applications.map((item) => this.localizeOption(lang, item)),
      crossSections: crossSections.map((item) => this.localizeOption(lang, item)),
      newestProfiles: newestProfiles.map((item) => mapProfileWithCustomer(item)),
    };
  }

  async getProfiles(filters: ProfileFilters, lang: Lang) {
    const where: any = {};
    const and: any[] = [];

    if (filters.q) {
      and.push({
        OR: [
          { name: { contains: filters.q, mode: 'insensitive' } },
          { nameDe: { contains: filters.q, mode: 'insensitive' } },
          { description: { contains: filters.q, mode: 'insensitive' } },
          { descriptionDe: { contains: filters.q, mode: 'insensitive' } },
          { usage: { contains: filters.q, mode: 'insensitive' } },
          { usageDe: { contains: filters.q, mode: 'insensitive' } },
        ],
      });
    }
    if (filters.applicationId) {
      and.push({ applications: { some: { id: filters.applicationId } } });
    }
    if (filters.crossSectionId) {
      and.push({ crossSections: { some: { id: filters.crossSectionId } } });
    }
    if (filters.supplierId) {
      and.push({ supplierId: filters.supplierId });
    }
    if (filters.material) {
      and.push({
        OR: [
          { material: { contains: filters.material, mode: 'insensitive' } },
          { materialDe: { contains: filters.material, mode: 'insensitive' } },
        ],
      });
    }
    if (filters.dimensions) {
      and.push({ dimensions: { contains: filters.dimensions, mode: 'insensitive' } });
    }
    if (and.length > 0) {
      where.AND = and;
    }

    const profiles = await this.prisma.profile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });

    const userIds = [...new Set(profiles.filter(p => p.ownerClerkUserId).map(p => p.ownerClerkUserId as string))];
    let userMap = new Map<string, string>();
    if (userIds.length > 0) {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const users = await clerk.users.getUserList({ userId: userIds });
        userMap = new Map(users.data.map((u: any) => [u.id, u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : (u.username || u.emailAddresses[0]?.emailAddress || 'Customer')]));
      } catch (error) {
        console.error('Failed to fetch clerk users for profiles:', error);
      }
    }

    return profiles.map((item) => {
      const p = { ...item };
      if (p.ownerClerkUserId && userMap.has(p.ownerClerkUserId)) {
        p.supplier = { id: 0, name: userMap.get(p.ownerClerkUserId) || 'Customer' } as any;
      }
      return this.localizeProfile(lang, p);
    });
  }

  async getProfileById(id: number, lang: Lang) {
    const profile = await this.prisma.profile.findFirst({
      where: { id },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });

    if (!profile) return null;

    if (profile.ownerClerkUserId) {
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const user = await clerk.users.getUser(profile.ownerClerkUserId);
        profile.supplier = {
          id: 0,
          name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || user.emailAddresses[0]?.emailAddress || 'Customer')
        } as any;
      } catch (error) {
        console.error('Failed to fetch clerk user for profile by id:', error);
      }
    }

    return this.localizeProfile(lang, profile);
  }
}

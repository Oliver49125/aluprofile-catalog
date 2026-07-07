import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { AppPermission, AppRole, Status } from '@prisma/client';

export type ProfileInput = {
  name?: string;
  nameDe?: string;
  description?: string;
  descriptionDe?: string;
  usage?: string;
  usageDe?: string;
  drawingUrl?: string;
  photoUrl?: string;
  logoUrl?: string;
  dimensions?: string;
  weightPerMeter?: number;
  material?: string;
  materialDe?: string;
  lengthMm?: number;
  status?: Status;

  applicationIds?: number[];
  crossSectionIds?: number[];
  supplierId?: number;
  price?: number;
  currencyId?: number;
};

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  getReferenceData() {
    return Promise.all([
      this.prisma.application.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.crossSection.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.currency.findMany({ orderBy: { code: 'asc' } }),
    ]).then(([applications, crossSections, suppliers, currencies]) => ({
      suppliers,
      applications,
      crossSections,
      currencies,
      statusOptions: Object.values(Status),
      roleOptions: Object.values(AppRole),
      permissionOptions: Object.values(AppPermission),
    }));
  }

  async listUsers(query?: string) {
    return this.prisma.user.findMany({
      where: query ? {
        OR: [
          { email: { contains: query, mode: 'insensitive' } },
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
        ],
      } : undefined,
      orderBy: [{ role: 'asc' }, { id: 'desc' }],
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        permissions: true,
        createdAt: true,
      }
    });
  }

  async createUser(input: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    role?: AppRole;
    permissions?: AppPermission[];
  }) {
    const email = input.email?.trim();
    if (!email) throw new BadRequestException('email is required');
    
    const password = input.password?.trim() || 'Welcome123!';
    const passwordHash = await bcrypt.hash(password, 10);

    return this.prisma.user.create({
      data: {
        email,
        username: input.username?.trim() || null,
        password: passwordHash,
        firstName: input.firstName?.trim() || null,
        lastName: input.lastName?.trim() || null,
        role: input.role || AppRole.USER,
        permissions: input.permissions || [AppPermission.VIEW_ADMIN],
      },
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, createdAt: true, username: true
      }
    });
  }

  async updateUser(id: number, input: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    role?: AppRole;
    permissions?: AppPermission[];
  }) {
    const data: any = {};
    if (input.email !== undefined) data.email = input.email.trim();
    if (input.firstName !== undefined) data.firstName = input.firstName.trim() || null;
    if (input.lastName !== undefined) data.lastName = input.lastName.trim() || null;
    if (input.username !== undefined) data.username = input.username.trim() || null;
    if (input.role) data.role = input.role;
    if (input.permissions) data.permissions = input.permissions;

    if (input.password?.trim()) {
      data.password = await bcrypt.hash(input.password.trim(), 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, email: true, firstName: true, lastName: true, role: true, permissions: true, createdAt: true, username: true
      }
    });
  }

  async deleteUser(id: number) {
    const deleted = await this.prisma.user.delete({ where: { id } });
    return { ok: true, deleted: { id: deleted.id, email: deleted.email } };
  }



  listSuppliers() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { profiles: true } } },
    });
  }

  createSupplier(input: {
    name: string;
    nameDe?: string;
    address?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
    uid?: string;
  }) {
    return this.prisma.supplier.create({ data: input });
  }

  updateSupplier(id: number, input: {
    name?: string;
    nameDe?: string;
    address?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    website?: string;
    uid?: string;
  }) {
    return this.prisma.supplier.update({ where: { id }, data: input });
  }

  deleteSupplier(id: number) {
    return this.prisma.supplier.delete({ where: { id } });
  }

  // --- Currencies ---
  getCurrencies() {
    return this.prisma.currency.findMany({ orderBy: { code: 'asc' } });
  }

  createCurrency(input: { code: string; symbol: string }) {
    if (!input.code || !input.symbol) throw new BadRequestException('code and symbol are required');
    return this.prisma.currency.create({ data: input });
  }

  updateCurrency(id: number, input: { code: string; symbol: string }) {
    return this.prisma.currency.update({ where: { id }, data: input });
  }

  deleteCurrency(id: number) {
    return this.prisma.currency.delete({ where: { id } });
  }

  listApplications() {
    return this.prisma.application.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { profiles: true } } },
    });
  }

  createApplication(input: { name: string; nameDe?: string }) {
    return this.prisma.application.create({ data: input });
  }

  updateApplication(id: number, input: { name: string; nameDe?: string }) {
    return this.prisma.application.update({ where: { id }, data: input });
  }

  deleteApplication(id: number) {
    return this.prisma.application.delete({ where: { id } });
  }

  listCrossSections() {
    return this.prisma.crossSection.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { profiles: true } } },
    });
  }

  createCrossSection(input: { name: string; nameDe?: string }) {
    return this.prisma.crossSection.create({ data: input });
  }

  updateCrossSection(id: number, input: { name: string; nameDe?: string }) {
    return this.prisma.crossSection.update({ where: { id }, data: input });
  }

  deleteCrossSection(id: number) {
    return this.prisma.crossSection.delete({ where: { id } });
  }

  async listProfiles() {
    const profiles = await this.prisma.profile.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
        currency: true,
      },
    });

    const userIds = [...new Set(profiles.filter(p => p.ownerUserId).map(p => p.ownerUserId as number))];
    const userMap = new Map<number, string>();
    if (userIds.length > 0) {
      try {
        const users = await this.prisma.user.findMany({ where: { id: { in: userIds } } });
        users.forEach(u => {
          userMap.set(u.id, `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email);
        });
      } catch (error) {
        console.error('Failed to fetch users for admin profiles:', error);
      }
    }

    profiles.forEach(p => {
      if (p.ownerUserId && userMap.has(p.ownerUserId)) {
        p.supplier = { id: 0, name: userMap.get(p.ownerUserId) || 'Customer' } as any;
      }
    });
    return profiles;
  }

  async createProfile(input: ProfileInput) {
    if (!input.name) {
      throw new BadRequestException('name is required');
    }
    return this.prisma.profile.create({
      data: {
        name: input.name,
        nameDe: input.nameDe,
        description: input.description,
        descriptionDe: input.descriptionDe,
        usage: input.usage,
        usageDe: input.usageDe,
        drawingUrl: input.drawingUrl,
        photoUrl: input.photoUrl,
        logoUrl: input.logoUrl,
        dimensions: input.dimensions,
        weightPerMeter: input.weightPerMeter,
        material: input.material,
        materialDe: input.materialDe,
        lengthMm: input.lengthMm,
        status: input.status ?? Status.AVAILABLE,
        price: input.price,
        currencyId: input.currencyId || null,
        applications: {
          connect: (input.applicationIds ?? []).map((id) => ({ id })),
        },
        crossSections: {
          connect: (input.crossSectionIds ?? []).map((id) => ({ id })),
        },
      },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
        currency: true,
      },
    });
  }

  async updateProfile(id: number, input: Partial<ProfileInput>) {
    const existing = await this.prisma.profile.findUnique({
      where: { id },
      include: { applications: true, crossSections: true, currency: true },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { id },
      data: {
        name: input.name,
        nameDe: input.nameDe,
        description: input.description,
        descriptionDe: input.descriptionDe,
        usage: input.usage,
        usageDe: input.usageDe,
        drawingUrl: input.drawingUrl,
        photoUrl: input.photoUrl,
        logoUrl: input.logoUrl,
        dimensions: input.dimensions,
        weightPerMeter: input.weightPerMeter,
        material: input.material,
        materialDe: input.materialDe,
        lengthMm: input.lengthMm,
        status: input.status,
        price: input.price,
        currencyId: input.currencyId || null,

        applications: input.applicationIds
          ? {
              set: input.applicationIds.map((appId) => ({ id: appId })),
            }
          : undefined,
        crossSections: input.crossSectionIds
          ? {
              set: input.crossSectionIds.map((crossId) => ({ id: crossId })),
            }
          : undefined,
      },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
        currency: true,
      },
    });
  }

  deleteProfile(id: number) {
    return this.prisma.profile.delete({ where: { id } });
  }

  async seedDemoData() {
    const seedSupplier = async (data: any) => {
      const existing = await this.prisma.supplier.findFirst({ where: { name: data.name } });
      if (existing) {
        return this.prisma.supplier.update({ where: { id: existing.id }, data });
      }
      return this.prisma.supplier.create({ data });
    };

    const suppliers = await Promise.all([
      seedSupplier({
        name: 'Aluzone GmbH',
        nameDe: 'Aluzone GmbH',
        address: 'Grosse Stadtgutgasse 29/12, A-1020 Wien',
        contactPerson: 'Oliver Kascha',
        phone: '+43 699 122 35 850',
        email: 'office@aluzone.example',
        website: 'https://aluprofile.biz',
      }),
      seedSupplier({
        name: 'Tepro Tec',
        nameDe: 'Tepro Tec',
        contactPerson: 'Sales Team',
        phone: '+43 676 123 4567',
        website: 'https://tepro.example',
      }),
      seedSupplier({
        name: 'DasaTech',
        nameDe: 'DasaTech',
        contactPerson: 'Operations Desk',
        phone: '+43 678 590 9989',
        website: 'https://dasatech.example',
      }),
    ]);

    const applications = await Promise.all([
      this.prisma.application.upsert({
        where: { name: 'Maschinenbau' },
        update: { nameDe: 'Maschinenbau' },
        create: { name: 'Maschinenbau', nameDe: 'Maschinenbau' },
      }),
      this.prisma.application.upsert({
        where: { name: 'Solaranlagen' },
        update: { nameDe: 'Solaranlagen' },
        create: { name: 'Solaranlagen', nameDe: 'Solaranlagen' },
      }),
      this.prisma.application.upsert({
        where: { name: 'Transportkiste' },
        update: { nameDe: 'Transportkiste' },
        create: { name: 'Transportkiste', nameDe: 'Transportkiste' },
      }),
    ]);

    const crossSections = await Promise.all([
      this.prisma.crossSection.upsert({
        where: { name: '40x40 Leicht' },
        update: { nameDe: '40x40 Leicht' },
        create: { name: '40x40 Leicht', nameDe: '40x40 Leicht' },
      }),
      this.prisma.crossSection.upsert({
        where: { name: 'U-Profil 40x20x40' },
        update: { nameDe: 'U-Profil 40x20x40' },
        create: { name: 'U-Profil 40x20x40', nameDe: 'U-Profil 40x20x40' },
      }),
      this.prisma.crossSection.upsert({
        where: { name: 'Trennwandsystem 9.5x26x5.8' },
        update: { nameDe: 'Trennwandsystem 9.5x26x5.8' },
        create: { name: 'Trennwandsystem 9.5x26x5.8', nameDe: 'Trennwandsystem 9.5x26x5.8' },
      }),
    ]);

    const profileSeed = [
      {
        name: 'B40 Sonderprofil',
        nameDe: 'B40 Sonderprofil',
        description: '40x40mm modular profile for machine frames.',
        descriptionDe: '40x40mm modulares Profil fur Maschinenrahmen.',
        usage: 'Maschinenbauteil',
        usageDe: 'Maschinenbauteil',
        dimensions: '40x40mm',
        weightPerMeter: 1.74,
        material: 'Al Mg Si 0.5',
        materialDe: 'Al Mg Si 0,5',
        lengthMm: 6000,
        drawingUrl: 'https://dummyimage.com/640x360/e9f2f2/19474f.png&text=B40+Drawing',
        photoUrl: 'https://dummyimage.com/640x360/dbe7ea/19474f.png&text=B40+Usage+Photo',
        logoUrl: 'https://dummyimage.com/220x220/f0f5f5/19474f.png&text=Aluzone',
        status: Status.AVAILABLE,
        supplierId: suppliers[0].id,
        applicationIds: [applications[0].id],
        crossSectionIds: [crossSections[0].id],
      },
      {
        name: 'X-Profil Transport',
        nameDe: 'X-Profil Transport',
        description: 'Rigid profile for flightcase and transport constructions.',
        descriptionDe: 'Starres Profil fur Flightcase- und Transportkonstruktionen.',
        usage: 'X-Profil Transportkiste',
        usageDe: 'X-Profil Transportkiste',
        dimensions: '40x40mm',
        weightPerMeter: 0.67,
        material: 'Aluminium',
        materialDe: 'Aluminium',
        lengthMm: 5800,
        drawingUrl: 'https://dummyimage.com/640x360/e6edf0/1e3a47.png&text=X-Profil+Drawing',
        photoUrl: 'https://dummyimage.com/640x360/d9e5eb/1e3a47.png&text=Flightcase+Usage',
        logoUrl: 'https://dummyimage.com/220x220/f2f6f8/1e3a47.png&text=Tepro+Tec',
        status: Status.IN_DEVELOPMENT,
        supplierId: suppliers[1].id,
        applicationIds: [applications[2].id],
        crossSectionIds: [crossSections[1].id],
      },
      {
        name: 'Trenner 9.5x26x5.8',
        nameDe: 'Trenner 9.5x26x5.8',
        description: 'Partition profile for lightweight interior systems.',
        descriptionDe: 'Trennprofil fur leichte Innenraumsysteme.',
        usage: 'Trennwandsystem',
        usageDe: 'Trennwandsystem',
        dimensions: '9.5x26x5.8',
        weightPerMeter: 0.31,
        material: 'Aluminium',
        materialDe: 'Aluminium',
        lengthMm: 4000,
        drawingUrl: 'https://dummyimage.com/640x360/e9eeea/2a5a3f.png&text=Trennwand+Drawing',
        photoUrl: 'https://dummyimage.com/640x360/dfe9e2/2a5a3f.png&text=Partition+Usage',
        logoUrl: 'https://dummyimage.com/220x220/f1f6f3/2a5a3f.png&text=DasaTech',
        status: Status.AVAILABLE,
        supplierId: suppliers[2].id,
        applicationIds: [applications[1].id],
        crossSectionIds: [crossSections[2].id],
      },
    ];

    for (const item of profileSeed) {
      const existing = await this.prisma.profile.findFirst({
        where: { name: item.name },
      });

      if (existing) {
        await this.prisma.profile.update({
          where: { id: existing.id },
          data: {
            nameDe: item.nameDe,
            description: item.description,
            descriptionDe: item.descriptionDe,
            usage: item.usage,
            usageDe: item.usageDe,
            dimensions: item.dimensions,
            weightPerMeter: item.weightPerMeter,
            material: item.material,
            materialDe: item.materialDe,
            lengthMm: item.lengthMm,
            drawingUrl: item.drawingUrl,
            photoUrl: item.photoUrl,
            logoUrl: item.logoUrl,
            status: item.status,
            supplier: { connect: { id: item.supplierId } },
            applications: {
              set: item.applicationIds.map((id) => ({ id })),
            },
            crossSections: {
              set: item.crossSectionIds.map((id) => ({ id })),
            },
          },
        });
      } else {
        await this.prisma.profile.create({
          data: {
            name: item.name,
            nameDe: item.nameDe,
            description: item.description,
            descriptionDe: item.descriptionDe,
            usage: item.usage,
            usageDe: item.usageDe,
            dimensions: item.dimensions,
            weightPerMeter: item.weightPerMeter,
            material: item.material,
            materialDe: item.materialDe,
            lengthMm: item.lengthMm,
            drawingUrl: item.drawingUrl,
            photoUrl: item.photoUrl,
            logoUrl: item.logoUrl,
            status: item.status,
            supplier: { connect: { id: item.supplierId } },
            applications: {
              connect: item.applicationIds.map((id) => ({ id })),
            },
            crossSections: {
              connect: item.crossSectionIds.map((id) => ({ id })),
            },
          },
        });
      }
    }

    const [profileCount, supplierCount, applicationCount, crossSectionCount] =
      await Promise.all([
        this.prisma.profile.count(),
        this.prisma.supplier.count(),
        this.prisma.application.count(),
        this.prisma.crossSection.count(),
      ]);

    return {
      message: 'Demo data seeded successfully',
      totals: {
        profiles: profileCount,
        suppliers: supplierCount,
        applications: applicationCount,
        crossSections: crossSectionCount,
      },
    };
  }
}

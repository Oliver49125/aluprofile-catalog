import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileInput } from '../admin/admin.service';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  getReferenceData() {
    return Promise.all([
      this.prisma.application.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.crossSection.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.currency.findMany({ orderBy: { code: 'asc' } }),
    ]).then(([applications, crossSections, currencies]) => ({
      suppliers: [],
      applications,
      crossSections,
      currencies,
      statusOptions: Object.values(Status),
    }));
  }


  async getSupplierProfile(userId: number) {
    let supplier = await this.prisma.supplier.findUnique({
      where: { userId },
    });
    if (!supplier) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const name = user && (user.firstName || user.lastName) 
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
        : (user?.email || 'Customer');
      
      supplier = await this.prisma.supplier.create({
        data: {
          userId,
          name,
        },
      });
    }
    return supplier;
  }

  async updateSupplierProfile(userId: number, input: any) {
    const supplier = await this.getSupplierProfile(userId);
    return this.prisma.supplier.update({
      where: { userId },
      data: {
        name: input.name,
        nameDe: input.nameDe,
        industry: input.industry,
        address: input.address,
        contactPerson: input.contactPerson,
        email: input.email,
        phone: input.phone,
        website: input.website,
        uid: input.uid,
      },
    });
  }

  listProfiles(userId: number) {
    return this.prisma.profile.findMany({
      where: { ownerUserId: userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
        currency: true,
      },
    });
  }


  async createProfile(userId: number, input: ProfileInput) {
    if (!input.name) {
      throw new BadRequestException('name is required');
    }

    const supplier = await this.getSupplierProfile(userId);

    return this.prisma.profile.create({
      data: {
        ownerUserId: userId,
        supplierId: supplier.id,
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
        price: input.price,
        currencyId: input.currencyId,
        status: input.status ?? Status.AVAILABLE,

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

  async updateProfile(userId: number, id: number, input: Partial<ProfileInput>) {
    const existing = await this.prisma.profile.findFirst({
      where: { id, ownerUserId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    const supplier = await this.getSupplierProfile(userId);

    return this.prisma.profile.update({
      where: { id },
      data: {
        supplierId: supplier.id,
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
        price: input.price,
        currencyId: input.currencyId,
        status: input.status,

        applications: input.applicationIds
          ? { set: input.applicationIds.map((appId) => ({ id: appId })) }
          : undefined,
        crossSections: input.crossSectionIds
          ? { set: input.crossSectionIds.map((crossId) => ({ id: crossId })) }
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

  async deleteProfile(userId: number, id: number) {
    const existing = await this.prisma.profile.findFirst({
      where: { id, ownerUserId: userId },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    await this.prisma.profile.delete({ where: { id } });
    return { ok: true, id };
  }

  async hideAllProfiles(userId: number) {
    return this.prisma.profile.updateMany({
      where: { ownerUserId: userId },
      data: { status: Status.NOT_AVAILABLE },
    });
  }
}

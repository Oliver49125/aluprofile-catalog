import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileInput } from '../admin/admin.service';
import { createClerkClient } from '@clerk/backend';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  getReferenceData() {
    return Promise.all([
      this.prisma.application.findMany({ orderBy: { name: 'asc' } }),
      this.prisma.crossSection.findMany({ orderBy: { name: 'asc' } }),
    ]).then(([applications, crossSections]) => ({
      suppliers: [],
      applications,
      crossSections,
      statusOptions: Object.values(Status),
    }));
  }


  async getSupplierProfile(clerkUserId: string) {
    let supplier = await this.prisma.supplier.findUnique({
      where: { clerkUserId },
    });
    if (!supplier) {
      let name = 'Customer';
      try {
        const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
        const user = await clerk.users.getUser(clerkUserId);
        name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : (user.username || user.emailAddresses[0]?.emailAddress || 'Customer');
      } catch (e) {
        console.error('Failed to fetch clerk user for supplier creation:', e);
      }
      
      supplier = await this.prisma.supplier.create({
        data: {
          clerkUserId,
          name,
        },
      });
    }
    return supplier;
  }

  async updateSupplierProfile(clerkUserId: string, input: any) {
    const supplier = await this.getSupplierProfile(clerkUserId);
    return this.prisma.supplier.update({
      where: { clerkUserId },
      data: {
        name: input.name,
        nameDe: input.nameDe,
        address: input.address,
        contactPerson: input.contactPerson,
        email: input.email,
        phone: input.phone,
        website: input.website,
      },
    });
  }

  listProfiles(clerkUserId: string) {
    return this.prisma.profile.findMany({
      where: { ownerClerkUserId: clerkUserId },
      orderBy: { updatedAt: 'desc' },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
      },
    });
  }


  async createProfile(clerkUserId: string, input: ProfileInput) {
    if (!input.name) {
      throw new BadRequestException('name is required');
    }

    const supplier = await this.getSupplierProfile(clerkUserId);

    return this.prisma.profile.create({
      data: {
        ownerClerkUserId: clerkUserId,
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
      },
    });
  }

  async updateProfile(clerkUserId: string, id: number, input: Partial<ProfileInput>) {
    const existing = await this.prisma.profile.findFirst({
      where: { id, ownerClerkUserId: clerkUserId },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    const supplier = await this.getSupplierProfile(clerkUserId);

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
      },
    });
  }

  async deleteProfile(clerkUserId: string, id: number) {
    const existing = await this.prisma.profile.findFirst({
      where: { id, ownerClerkUserId: clerkUserId },
    });
    if (!existing) {
      throw new NotFoundException('Profile not found');
    }

    await this.prisma.profile.delete({ where: { id } });
    return { ok: true, id };
  }
}

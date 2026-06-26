import { Injectable } from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

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
    const publicProfilesWhere = {
      status: { not: Status.NOT_AVAILABLE }
    };
    const [applications, crossSections, newestProfiles, totalProfiles, visitsMetric] = await Promise.all([
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
        include: { supplier: true, applications: true, crossSections: true, currency: true },
      }),
      this.prisma.profile.count({ where: publicProfilesWhere }),
      this.prisma.siteMetric.findUnique({ where: { key: 'visits' } }),
    ]);

    return {
      totals: { profiles: totalProfiles, visits: visitsMetric?.value || 0 },
      applications: applications.map((item) => this.localizeOption(lang, item)),
      crossSections: crossSections.map((item) => this.localizeOption(lang, item)),
      newestProfiles: newestProfiles.map((item) => this.localizeProfile(lang, item)),
    };
  }

  async getProfiles(filters: ProfileFilters, lang: Lang) {
    const where: any = {
      status: { not: Status.NOT_AVAILABLE }
    };
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
        currency: true,
      },
    });

    return profiles.map((item) => this.localizeProfile(lang, item));
  }

  async getProfileById(id: number, lang: Lang) {
    const profile = await this.prisma.profile.findFirst({
      where: { id, status: { not: Status.NOT_AVAILABLE } },
      include: {
        supplier: true,
        applications: true,
        crossSections: true,
        currency: true,
      },
    });

    if (!profile) return null;
    return this.localizeProfile(lang, profile);
  }

  async createInquiry(data: {
    profileId: number;
    firstName: string;
    lastName: string;
    company?: string;
    email: string;
    phone?: string;
    message: string;
    requestPurchase?: boolean;
  }) {
    // 1. Create the inquiry in the database
    const inquiry = await this.prisma.inquiry.create({
      data: {
        profileId: data.profileId,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        email: data.email,
        phone: data.phone,
        message: data.message,
        requestPurchase: data.requestPurchase ?? false,
      },
      include: {
        profile: {
          include: {
            supplier: true,
          }
        }
      }
    });

    // 2. Send the email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const profileName = inquiry.profile?.name || `Profile #${data.profileId}`;
        const supplierEmail = inquiry.profile?.supplier?.email;
        
        // Ensure info@aluprofile.biz is always notified, plus the customer and supplier
        const toEmails = ['info@aluprofile.biz', data.email];
        if (supplierEmail && supplierEmail.trim() !== '') {
          toEmails.push(supplierEmail.trim());
        }

        const emailContent = `
You have received a new inquiry from the Aluprofile Catalog.

Profile: ${profileName}
Name: ${data.firstName} ${data.lastName}
Company: ${data.company || '-'}
Email: ${data.email}
Phone: ${data.phone || '-'}
Request to Purchase: ${data.requestPurchase ? 'Yes' : 'No'}

Message:
${data.message}
        `.trim();

        // The default testing domain from Resend is onboarding@resend.dev
        // In production, you would configure a custom domain on Resend and set RESEND_FROM_EMAIL
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'Aluprofile Catalog <onboarding@resend.dev>';

        const response = await resend.emails.send({
          from: fromEmail,
          to: toEmails,
          replyTo: data.email,
          subject: `New Inquiry for ${profileName}`,
          text: emailContent,
        });

        if (response.error) {
          console.error('Failed to send inquiry email via Resend:', response.error);
        } else {
          console.log(`Inquiry email sent successfully to ${toEmails.join(', ')}`, response.data);
        }
      } catch (error) {
        console.error('Unexpected error while sending inquiry email:', error);
      }
    } else {
      console.warn('Email was not sent because RESEND_API_KEY is missing in environment variables.');
    }

    return inquiry;
  }

  async incrementVisit() {
    return this.prisma.siteMetric.upsert({
      where: { key: 'visits' },
      update: { value: { increment: 1 } },
      create: { key: 'visits', value: 1 },
    });
  }
}

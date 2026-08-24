import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PublicService } from './public.service';

type Lang = 'en' | 'de';

function normalizeLang(input?: string): Lang {
  return input?.toLowerCase() === 'de' ? 'de' : 'en';
}

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('overview')
  getOverview(@Query('lang') lang?: string) {
    return this.publicService.getOverview(normalizeLang(lang));
  }

  @Get('profiles')
  getProfiles(
    @Query('q') q?: string,
    @Query('applicationId') applicationId?: string,
    @Query('crossSectionId') crossSectionId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('material') material?: string,
    @Query('dimensions') dimensions?: string,
    @Query('lang') lang?: string,
  ) {
    return this.publicService.getProfiles(
      {
        q,
        material,
        dimensions,
        applicationId: applicationId ? Number(applicationId) : undefined,
        crossSectionId: crossSectionId ? Number(crossSectionId) : undefined,
        supplierId: supplierId ? Number(supplierId) : undefined,
      },
      normalizeLang(lang),
    );
  }

  @Get('profiles/:id')
  async getProfileById(
    @Param('id', ParseIntPipe) id: number,
    @Query('lang') lang?: string,
  ) {
    const profile = await this.publicService.getProfileById(id, normalizeLang(lang));
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Get('site-settings')
  getSiteSettings() {
    return this.publicService.getSiteSettings();
  }

  @Post('inquiries')
  async createInquiry(
    @Body() body: {
      profileId?: number;
      firstName: string;
      lastName: string;
      company?: string;
      email: string;
      phone?: string;
      message: string;
      requestPurchase?: boolean;
    }
  ) {
    return this.publicService.createInquiry({
      ...body,
      profileId: body.profileId ?? 0,
    });
  }

  @Post('manufacturers')
  async registerManufacturer(
    @Body() body: {
      companyName: string;
      contactPerson: string;
      email: string;
      phone?: string;
      website?: string;
      message?: string;
    }
  ) {
    return this.publicService.registerManufacturer(body);
  }

  @Post('visits')
  async incrementVisit(
    @Req() req: any,
    @Body() body?: {
      visitedPage?: string;
      profileSearched?: string;
      device?: string;
      browser?: string;
      os?: string;
      userType?: string;
      userEmail?: string;
      userName?: string;
      durationSeconds?: number;
      country?: string;
      city?: string;
      timezone?: string;
      ipAddress?: string;
    }
  ) {
    const rawIpHeader =
      req?.headers?.['x-forwarded-for'] ||
      req?.headers?.['x-real-ip'] ||
      req?.headers?.['cf-connecting-ip'] ||
      req?.socket?.remoteAddress;

    const rawIp = typeof rawIpHeader === 'string'
      ? rawIpHeader.split(',')[0].trim()
      : Array.isArray(rawIpHeader)
      ? rawIpHeader[0]
      : undefined;

    const cfCountry = req?.headers?.['cf-ipcountry'] as string;
    const vercelCountry = req?.headers?.['x-vercel-ip-country'] as string;
    const vercelCity = req?.headers?.['x-vercel-ip-city'] as string;

    return this.publicService.incrementVisit({
      ...body,
      ipAddress: body?.ipAddress || rawIp,
      country: body?.country || vercelCountry || cfCountry,
      city: body?.city || (vercelCity ? decodeURIComponent(vercelCity) : undefined),
    });
  }

  @Get('visitor-logs')
  async getVisitorLogs(
    @Query('timeRange') timeRange?: 'TODAY' | '7DAYS' | '30DAYS' | 'CUSTOM',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userType') userType?: string,
    @Query('device') device?: string,
    @Query('country') country?: string,
    @Query('q') q?: string,
  ) {
    return this.publicService.getVisitorLogs({
      timeRange: timeRange || 'TODAY',
      startDate,
      endDate,
      userType,
      device,
      country,
      q,
    });
  }
}

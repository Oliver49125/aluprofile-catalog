import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { AdminGuard } from '../auth/admin.guard';
import { AdminService, ProfileInput } from './admin.service';
import { AppPermission, AppRole, Status } from '@prisma/client';
import {
  RequirePermissions,
} from '../auth/authz.decorators';

function toNumberArray(input: unknown): number[] {
  if (Array.isArray(input)) {
    return input.map((item) => Number(item)).filter((item) => !Number.isNaN(item));
  }
  if (typeof input === 'string' && input.trim()) {
    return input
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item));
  }
  return [];
}

function parseLocalizedNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const str = String(value).trim().replace(',', '.');
  const num = Number(str);
  return isNaN(num) ? undefined : num;
}

function parseProfileBody(
  body: Record<string, unknown>,
): ProfileInput {
  return {
    name: body.name ? String(body.name) : undefined,
    nameDe: body.nameDe ? String(body.nameDe) : undefined,
    description: body.description ? String(body.description) : undefined,
    descriptionDe: body.descriptionDe ? String(body.descriptionDe) : undefined,
    usage: body.usage ? String(body.usage) : undefined,
    usageDe: body.usageDe ? String(body.usageDe) : undefined,
    drawingUrl: body.drawingUrl ? String(body.drawingUrl) : undefined,
    photoUrl: body.photoUrl ? String(body.photoUrl) : undefined,
    logoUrl: body.logoUrl ? String(body.logoUrl) : undefined,
    dimensions: body.dimensions ? String(body.dimensions) : undefined,
    weightPerMeter: parseLocalizedNumber(body.weightPerMeter),
    material: body.material ? String(body.material) : undefined,
    materialDe: body.materialDe ? String(body.materialDe) : undefined,
    lengthMm: parseLocalizedNumber(body.lengthMm),
    status: body.status ? (String(body.status) as Status) : undefined,
    price: parseLocalizedNumber(body.price),
    currencyId: body.currencyId ? Number(body.currencyId) : undefined,
    applicationIds: toNumberArray(body.applicationIds),
    crossSectionIds: toNumberArray(body.crossSectionIds),
    supplierId: body.supplierId ? Number(body.supplierId) : undefined,
  };
}

@Controller('admin')
@UseGuards(AdminGuard)
@RequirePermissions(AppPermission.VIEW_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('reference-data')
  getReferenceData() {
    return this.adminService.getReferenceData();
  }



  @Get('users')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  listUsers(@Query('query') query?: string) {
    return this.adminService.listUsers(query);
  }

  @Post('users')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  createUser(
    @Body()
    body: {
      email: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      role?: AppRole;
      permissions?: AppPermission[];
    },
  ) {
    return this.adminService.createUser(body);
  }

  @Put('users/:userId')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  updateUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body()
    body: {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
      role?: AppRole;
      permissions?: AppPermission[];
    },
  ) {
    return this.adminService.updateUser(userId, body);
  }

  @Delete('users/:userId')
  @RequirePermissions(AppPermission.USERS_MANAGE)
  deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.adminService.deleteUser(userId);
  }


  @Get('suppliers')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  listSuppliers() {
    return this.adminService.listSuppliers();
  }

  @Post('suppliers')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  createSupplier(@Body() body: { name: string; nameDe?: string; address?: string; contactPerson?: string; email?: string; phone?: string; website?: string; uid?: string; }) {
    return this.adminService.createSupplier({
      name: body.name,
      nameDe: body.nameDe,
      address: body.address,
      contactPerson: body.contactPerson,
      email: body.email,
      phone: body.phone,
      website: body.website,
      uid: body.uid,
    });
  }

  @Put('suppliers/:id')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  updateSupplier(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; nameDe?: string; address?: string; contactPerson?: string; email?: string; phone?: string; website?: string; uid?: string; },
  ) {
    return this.adminService.updateSupplier(id, {
      name: body.name,
      nameDe: body.nameDe,
      address: body.address,
      contactPerson: body.contactPerson,
      email: body.email,
      phone: body.phone,
      website: body.website,
      uid: body.uid,
    });
  }

  @Delete('suppliers/:id')
  @RequirePermissions(AppPermission.SUPPLIERS_MANAGE)
  deleteSupplier(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteSupplier(id);
  }

  // --- Currencies ---

  @Get('currencies')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  getCurrencies() {
    return this.adminService.getCurrencies();
  }

  @Post('currencies')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  createCurrency(@Body() body: { code: string; symbol: string }) {
    return this.adminService.createCurrency(body);
  }

  @Put('currencies/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  updateCurrency(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { code: string; symbol: string }
  ) {
    return this.adminService.updateCurrency(id, body);
  }

  @Delete('currencies/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  deleteCurrency(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCurrency(id);
  }

  // --- Applications ---

  @Get('applications')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  listApplications() {
    return this.adminService.listApplications();
  }

  @Post('applications')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  createApplication(@Body() body: { name: string; nameDe?: string }) {
    return this.adminService.createApplication({
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Put('applications/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  updateApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; nameDe?: string },
  ) {
    return this.adminService.updateApplication(id, {
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Delete('applications/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  deleteApplication(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteApplication(id);
  }

  @Get('cross-sections')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  listCrossSections() {
    return this.adminService.listCrossSections();
  }

  @Post('cross-sections')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  createCrossSection(@Body() body: { name: string; nameDe?: string }) {
    return this.adminService.createCrossSection({
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Put('cross-sections/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  updateCrossSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name: string; nameDe?: string },
  ) {
    return this.adminService.updateCrossSection(id, {
      name: body.name,
      nameDe: body.nameDe,
    });
  }

  @Delete('cross-sections/:id')
  @RequirePermissions(AppPermission.CATEGORIES_MANAGE)
  deleteCrossSection(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCrossSection(id);
  }



  @Get('profiles')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  listProfiles() {
    return this.adminService.listProfiles();
  }

  @Post('profiles')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  createProfile(@Body() body: Record<string, unknown>) {
    return this.adminService.createProfile(parseProfileBody(body));
  }

  @Put('profiles/:id')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Record<string, unknown>,
  ) {
    return this.adminService.updateProfile(id, parseProfileBody(body));
  }

  @Delete('profiles/:id')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  deleteProfile(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteProfile(id);
  }

  @Post('uploads')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'),
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname || '');
          callback(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword', // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'application/vnd.ms-excel', // .xls
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
        ];
        const allowed = file.mimetype.startsWith('image/') || allowedMimeTypes.includes(file.mimetype);
        callback(null, allowed);
      },
      limits: {
        fileSize: 12 * 1024 * 1024,
      },
    }),
  )
  uploadFile(@UploadedFile() file: any, @Req() req: Request) {
    if (!file?.filename) {
      throw new BadRequestException('No valid file uploaded');
    }
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = `${protocol}://${req.get('host')}`;
    return {
      url: `${host}/uploads/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Post('demo-data/seed')
  @RequirePermissions(AppPermission.PROFILES_MANAGE)
  seedDemoData() {
    return this.adminService.seedDemoData();
  }
}
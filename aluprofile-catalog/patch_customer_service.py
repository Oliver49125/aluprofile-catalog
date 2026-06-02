import re

with open("apps/backend/src/customer/customer.service.ts", "r") as f:
    content = f.read()

# 1. Add createClerkClient import
if "createClerkClient" not in content:
    content = content.replace("import { ProfileInput } from '../admin/admin.service';", "import { ProfileInput } from '../admin/admin.service';\nimport { createClerkClient } from '@clerk/backend';")

# 2. Add Supplier logic
supplier_logic = """
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

  listProfiles(clerkUserId: string) {"""

content = content.replace("  listProfiles(clerkUserId: string) {", supplier_logic)

# 3. Inject supplierId into createProfile
create_profile_logic = """
  async createProfile(clerkUserId: string, input: ProfileInput) {
    if (!input.name) {
      throw new BadRequestException('name is required');
    }

    const supplier = await this.getSupplierProfile(clerkUserId);

    return this.prisma.profile.create({
      data: {
        ownerClerkUserId: clerkUserId,
        supplierId: supplier.id,"""

content = content.replace("""  async createProfile(clerkUserId: string, input: ProfileInput) {
    if (!input.name) {
      throw new BadRequestException('name is required');
    }

    return this.prisma.profile.create({
      data: {
        ownerClerkUserId: clerkUserId,""", create_profile_logic)

with open("apps/backend/src/customer/customer.service.ts", "w") as f:
    f.write(content)

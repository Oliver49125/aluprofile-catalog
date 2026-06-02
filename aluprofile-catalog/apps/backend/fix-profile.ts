import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.profile.updateMany({
    where: { supplierId: null, ownerClerkUserId: { not: null } },
    data: { supplierId: 4 }
  });
  console.log("Fixed!");
}
main();

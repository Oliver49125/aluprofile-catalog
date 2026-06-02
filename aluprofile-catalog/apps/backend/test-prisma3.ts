import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const profiles = await prisma.profile.findMany();
    console.log("Profiles:");
    profiles.forEach(p => console.log(`ID: ${p.id}, name: ${p.name}, supplierId: ${p.supplierId}`));
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();

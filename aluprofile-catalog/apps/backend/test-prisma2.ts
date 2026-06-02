import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const suppliers = await prisma.supplier.findMany();
    console.log("Suppliers:", suppliers);
  } catch(e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

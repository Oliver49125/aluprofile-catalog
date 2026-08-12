-- DropIndex
DROP INDEX IF EXISTS "Supplier_name_key";

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "clerkUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_clerkUserId_key" ON "Supplier"("clerkUserId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "SiteMetric" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SiteMetric_key_key" ON "SiteMetric"("key");

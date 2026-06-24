-- DropIndex
DROP INDEX IF EXISTS "Profile_ownerClerkUserId_idx";

-- DropIndex
DROP INDEX IF EXISTS "Supplier_clerkUserId_key";

-- AlterTable - Profile: drop old column and add new columns if they don't exist
ALTER TABLE "Profile" DROP COLUMN IF EXISTS "ownerClerkUserId";
DO $ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Profile' AND column_name='currencyId') THEN
    ALTER TABLE "Profile" ADD COLUMN "currencyId" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Profile' AND column_name='ownerUserId') THEN
    ALTER TABLE "Profile" ADD COLUMN "ownerUserId" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Profile' AND column_name='price') THEN
    ALTER TABLE "Profile" ADD COLUMN "price" DOUBLE PRECISION;
  END IF;
END $;

-- AlterTable - Supplier: drop old column and add new columns if they don't exist
ALTER TABLE "Supplier" DROP COLUMN IF EXISTS "clerkUserId";
DO $ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Supplier' AND column_name='industry') THEN
    ALTER TABLE "Supplier" ADD COLUMN "industry" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Supplier' AND column_name='uid') THEN
    ALTER TABLE "Supplier" ADD COLUMN "uid" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Supplier' AND column_name='userId') THEN
    ALTER TABLE "Supplier" ADD COLUMN "userId" INTEGER;
  END IF;
END $;

-- DropTable
DROP TABLE IF EXISTS "UserAccess";

-- CreateTable
CREATE TABLE IF NOT EXISTS "Currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "AppRole" NOT NULL DEFAULT 'USER',
    "permissions" "AppPermission"[] DEFAULT ARRAY['VIEW_ADMIN']::"AppPermission"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Profile_ownerUserId_idx" ON "Profile"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Supplier_userId_key" ON "Supplier"("userId");

-- AddForeignKey
DO $ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Profile_ownerUserId_fkey') THEN
    ALTER TABLE "Profile" ADD CONSTRAINT "Profile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $;

-- AddForeignKey
DO $ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Profile_currencyId_fkey') THEN
    ALTER TABLE "Profile" ADD CONSTRAINT "Profile_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $;

-- AddForeignKey
DO $ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Supplier_userId_fkey') THEN
    ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $;


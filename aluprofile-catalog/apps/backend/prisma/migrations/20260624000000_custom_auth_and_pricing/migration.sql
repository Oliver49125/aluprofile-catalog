-- DropIndex
DROP INDEX "Profile_ownerClerkUserId_idx";

-- DropIndex
DROP INDEX "Supplier_clerkUserId_key";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "ownerClerkUserId",
ADD COLUMN     "currencyId" INTEGER,
ADD COLUMN     "ownerUserId" INTEGER,
ADD COLUMN     "price" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Supplier" DROP COLUMN "clerkUserId",
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "uid" TEXT,
ADD COLUMN     "userId" INTEGER;

-- DropTable
DROP TABLE "UserAccess";

-- CreateTable
CREATE TABLE "Currency" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
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
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Profile_ownerUserId_idx" ON "Profile"("ownerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_userId_key" ON "Supplier"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


/*
  Warnings:

  - The values [OPERATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('Budget', 'Moderate', 'Upscale', 'Luxury');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('TOURIST', 'HOTEL_OWNER', 'HIRE_CAR_OWNER', 'DESTINATION_OWNER', 'ADMIN');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'TOURIST';

-- CreateTable
CREATE TABLE "Hotel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "starRating" INTEGER,
    "roomCount" INTEGER,
    "priceRange" "PriceRange",
    "amenities" TEXT[],
    "osmId" TEXT,
    "osmType" TEXT,
    "wikidata" TEXT,
    "wikipedia" TEXT,
    "images" TEXT[],
    "featuredImage" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "destinationId" INTEGER,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HireCar" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "vehicleType" TEXT,
    "passengerCapacity" INTEGER,
    "pricePerDay" DOUBLE PRECISION,
    "priceRange" "PriceRange",
    "features" TEXT[],
    "images" TEXT[],
    "featuredImage" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HireCar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hotel_osmId_key" ON "Hotel"("osmId");

-- CreateIndex
CREATE INDEX "Hotel_province_idx" ON "Hotel"("province");

-- CreateIndex
CREATE INDEX "Hotel_featured_idx" ON "Hotel"("featured");

-- CreateIndex
CREATE INDEX "Hotel_active_idx" ON "Hotel"("active");

-- CreateIndex
CREATE INDEX "Hotel_osmId_idx" ON "Hotel"("osmId");

-- CreateIndex
CREATE INDEX "HireCar_province_idx" ON "HireCar"("province");

-- CreateIndex
CREATE INDEX "HireCar_featured_idx" ON "HireCar"("featured");

-- CreateIndex
CREATE INDEX "HireCar_active_idx" ON "HireCar"("active");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "Message"("isRead");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotel" ADD CONSTRAINT "Hotel_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HireCar" ADD CONSTRAINT "HireCar_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

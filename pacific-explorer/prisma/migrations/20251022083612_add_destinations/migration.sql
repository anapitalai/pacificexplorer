-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Coastal', 'Inland', 'Geothermal', 'Cultural');

-- CreateEnum
CREATE TYPE "Accessibility" AS ENUM ('Easy', 'Moderate', 'Difficult');

-- CreateTable
CREATE TABLE "Destination" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "satelliteImageUrl" TEXT,
    "activities" TEXT[],
    "bestTimeToVisit" TEXT NOT NULL,
    "accessibility" "Accessibility" NOT NULL,
    "highlights" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Destination_category_idx" ON "Destination"("category");

-- CreateIndex
CREATE INDEX "Destination_featured_idx" ON "Destination"("featured");

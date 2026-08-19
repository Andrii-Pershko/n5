-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'MANAGER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('BANK', 'FINTECH', 'PAYMENT', 'EMI', 'CRYPTO');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ACTIVE', 'LICENSE_ONLY');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "country" TEXT,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "publicCode" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "category" "BusinessCategory" NOT NULL,
    "licenseType" TEXT NOT NULL,
    "licenseName" TEXT NOT NULL,
    "regulator" TEXT,
    "businessStatus" "BusinessStatus" NOT NULL,
    "assetType" TEXT NOT NULL,
    "priceEur" INTEGER NOT NULL,
    "employees" INTEGER,
    "yearOfIssue" INTEGER,
    "included" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isTopDeal" BOOLEAN NOT NULL DEFAULT false,
    "isValidated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "userId" TEXT NOT NULL,
    "ticketMinEur" INTEGER NOT NULL,
    "ticketMaxEur" INTEGER NOT NULL,
    "countries" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "licenses" TEXT NOT NULL,
    "thesis" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Inquiry" (
    "id" TEXT NOT NULL,
    "threadKey" TEXT NOT NULL,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "assetId" TEXT,
    "message" TEXT NOT NULL,
    "matchScore" INTEGER,
    "matchReasons" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_publicCode_key" ON "Asset"("publicCode");

-- CreateIndex
CREATE INDEX "Asset_sellerId_idx" ON "Asset"("sellerId");

-- CreateIndex
CREATE INDEX "Asset_category_country_idx" ON "Asset"("category", "country");

-- CreateIndex
CREATE UNIQUE INDEX "Inquiry_threadKey_key" ON "Inquiry"("threadKey");

-- CreateIndex
CREATE INDEX "Inquiry_fromUserId_idx" ON "Inquiry"("fromUserId");

-- CreateIndex
CREATE INDEX "Inquiry_toUserId_idx" ON "Inquiry"("toUserId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

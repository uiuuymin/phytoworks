-- CreateEnum
CREATE TYPE "PurchaseMode" AS ENUM ('QUOTE_REQUIRED', 'DIRECT_PURCHASE');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "features" TEXT[],
    "mediaLabel" TEXT NOT NULL,
    "purchaseMode" "PurchaseMode" NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

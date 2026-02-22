/*
  Warnings:

  - You are about to alter the column `unitPrice` on the `Inventory` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Added the required column `unit` to the `Inventory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InventoryUnit" AS ENUM ('PCS', 'KG', 'G', 'L', 'ML');

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "unit" "InventoryUnit" NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(65,30);

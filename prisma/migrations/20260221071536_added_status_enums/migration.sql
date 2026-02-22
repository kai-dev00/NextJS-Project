/*
  Warnings:

  - The `status` column on the `Inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('in_stock', 'low_stock', 'out_of_stock', 'warning', 'discontinued');

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "status",
ADD COLUMN     "status" "InventoryStatus";

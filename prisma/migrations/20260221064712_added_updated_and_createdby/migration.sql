-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT;

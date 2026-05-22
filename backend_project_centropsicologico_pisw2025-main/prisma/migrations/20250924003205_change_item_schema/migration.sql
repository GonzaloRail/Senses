/*
  Warnings:

  - You are about to drop the column `description` on the `ItemInstance` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ItemInstance" DROP CONSTRAINT "ItemInstance_officeId_fkey";

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "description" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ItemInstance" DROP COLUMN "description",
ALTER COLUMN "officeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ItemInstance" ADD CONSTRAINT "ItemInstance_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;

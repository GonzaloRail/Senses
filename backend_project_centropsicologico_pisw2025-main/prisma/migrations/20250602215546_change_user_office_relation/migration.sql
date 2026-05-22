/*
  Warnings:

  - You are about to drop the column `userId` on the `Office` table. All the data in the column will be lost.
  - Added the required column `officeId` to the `WorkSchedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_userId_fkey";

-- AlterTable
ALTER TABLE "Office" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "WorkSchedule" ADD COLUMN     "officeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WorkSchedule" ADD CONSTRAINT "WorkSchedule_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

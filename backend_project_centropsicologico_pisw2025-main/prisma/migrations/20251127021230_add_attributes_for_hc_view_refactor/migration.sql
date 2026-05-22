-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN     "openNewSection" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sectionOrder" INTEGER NOT NULL DEFAULT 0;

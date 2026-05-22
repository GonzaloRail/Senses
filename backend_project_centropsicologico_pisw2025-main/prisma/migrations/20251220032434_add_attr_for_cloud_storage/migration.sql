-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "bucketName" TEXT,
ADD COLUMN     "filePath" TEXT,
ALTER COLUMN "fileUrl" DROP NOT NULL;

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('PARTICULAR', 'SOCIAL');

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "type" "AppointmentType" NOT NULL DEFAULT 'PARTICULAR';

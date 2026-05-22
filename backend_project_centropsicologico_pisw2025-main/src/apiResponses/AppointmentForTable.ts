import { AppointmentStatus } from "@prisma/client";

export interface AppointmentForTable {
  id: string;
  patientName: string;
  startDateTime: Date;
  psychologistName: string;
  status: AppointmentStatus;
}

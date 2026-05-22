import { Appointment } from "./Appointment";
import { ClinicalHistory } from "./ClinicalHistory";
import { Document } from "./Document";
import { Test } from "./Test";
import { User } from "./User";

export interface PatientTest {
  id: string;

  testId: string;
  test: Test;

  clinicalHistoryId: string;
  clinicalHistory: ClinicalHistory;

  appointmentId?: String;
  appointment?: Appointment;

  isGeneralDoc: boolean;

  document?: Document;

  completedById: string;
  completedBy: User;

  completedAt: Date;
}

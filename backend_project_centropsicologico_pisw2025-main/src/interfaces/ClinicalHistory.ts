import { Patient } from "./Patient";
import { PatientTest } from "./PatientTest";

export interface ClinicalHistory {
  id: string;
  displayInt: number;

  patientTests: PatientTest[];
  patient?: Patient;

  createdAt: Date;
  updatedAt: Date;
}

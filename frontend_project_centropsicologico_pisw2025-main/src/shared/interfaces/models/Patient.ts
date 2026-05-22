import type { Appointment } from "./Appointment";
import type { ClinicalHistory } from "./ClinicalHistory";
import type { District } from "./District";
import type { User } from "./User";

export type Gender = "MALE" | "FEMALE" | "LGBTQ" | "NOT_SPECIFIED";

export type MaritalStatus = "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED" | "COHABITANT";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  gender: Gender;
  birthdate: Date;
  educationLevel: string;
  birthPlace: string;
  occupation: string;
  maritalStatus: MaritalStatus;
  religion?: string;
  occupationLocation: string;
  phoneNumber: string;
  isActive: boolean;
  address: string;

  parentFullName?: string;
  parentDni?: string;
  parentPhoneNumber?: string;

  districtId: string;
  district: Partial<District>;

  psychologistId?: string;
  psychologist?: User;

  clinicalHistoryId: string;
  clinicalHistory: ClinicalHistory;

  appointments: Appointment[];

  createdAt: Date;
  updatedAt: Date;
}

// Minimal patient
export type PatientMinimal = Pick<
  Patient,
  "id" | "dni" | "firstName" | "lastName"
>;

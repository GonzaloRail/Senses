import { Appointment } from "./Appointment";
import { ClinicalHistory } from "./ClinicalHistory";
import { District } from "./District";
import { User } from "./User";

type Gender = "MALE" | "FEMALE" | "LGBTQ" | "NOT_SPECIFIED";

type MaritalStatus = "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED" | "COHABITANT";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  gender: Gender;
  birthDate: Date;
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
  district: District;

  psychologistId?: string;
  psychologist?: User;

  clinicalHistoryId: string;
  clinicalHistory: ClinicalHistory;

  appointments: Appointment[];

  createdAt: Date;
  updatedAt: Date;
}

export type PatientMinimal = Pick<
  Patient,
  "id" | "dni" | "firstName" | "lastName"
>;

export type PatientExcel = {
  firstName: string;
  lastName: string;
  dni: string;
  gender: "MALE" | "FEMALE" | "LGBTQ" | "NOT_SPECIFIED";
  birthdate: Date;
  educationLevel: string;
  birthPlace: string;
  occupation: string;
  address: string;
  maritalStatus: "SINGLE" | "MARRIED" | "WIDOWED" | "DIVORCED" | "COHABITANT";
  religion?: string | null;
  occupationLocation: string;
  phoneNumber: string;
  parentFullName?: string | null;
  parentDni?: string | null;
  parentPhoneNumber?: string | null;
};
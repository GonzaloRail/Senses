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

type PatientExcelSelectionType = string;

export type PatientExcelIntakeOption = {
  id: string;
  code: string;
  name: string;
  category?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type PatientExcelIntakeOptionGroup = {
  id: string;
  code: string;
  name: string;
  selectionType: PatientExcelSelectionType;
  isActive: boolean;
  options?: PatientExcelIntakeOption[];
};

export type PatientExcelConsentType = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

export type PatientExcel = {
  id: string;
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
  districtId: string;
  district: {
    id: string;
    name: string;
    province: {
      id: string;
      name: string;
      region: {
        id: string;
        name: string;
      };
    };
  };
  psychologistId?: string | null;
  psychologist?: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
  } | null;
  clinicalHistoryId: string;
  clinicalHistory: {
    id: string;
    displayInt: number;
  };
  isActive: boolean;
  intakeInfo?: {
    id: string;
    email?: string | null;
    sex?: string | null;
    livesWithText?: string | null;
    childrenCount?: number | null;
    guardianName?: string | null;
    guardianPhone?: string | null;
    mainConsultationReason?: string | null;
    situationDurationText?: string | null;
    hadPreviousTherapy?: boolean | null;
    takesPsychiatricMedication?: boolean | null;
    comparedOtherCenters?: boolean | null;
    referredByName?: string | null;
    referredByRelation?: string | null;
    referredByPhone?: string | null;
    attractionNote?: string | null;
    incomeRangeId?: string | null;
    incomeRange?: {
      id: string;
      label: string;
      minAmount?: unknown;
      maxAmount?: unknown;
      sortOrder: number;
      isActive: boolean;
    } | null;
    extraData?: unknown;
    selections: {
      intakeOptionId: string;
      isPrimary: boolean;
      notes?: string | null;
      createdAt: Date;
      intakeOption: PatientExcelIntakeOption & {
        group: PatientExcelIntakeOptionGroup;
      };
    }[];
    createdAt: Date;
    updatedAt: Date;
  } | null;
  patientConsents: {
    id: string;
    consentTypeId: string;
    accepted: boolean;
    policyVersion?: string | null;
    acceptedAt?: Date | null;
    createdAt: Date;
    consentType: PatientExcelConsentType;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export type PatientExcelExportData = {
  patients: PatientExcel[];
  intakeOptionGroups: PatientExcelIntakeOptionGroup[];
  consentTypes: PatientExcelConsentType[];
};

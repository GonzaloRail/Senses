import { Office } from "./Office";
import { Patient } from "./Patient";
import { User } from "./User";
import { PatientTest } from "./PatientTest";

type AppointmentType = "PARTICULAR" | "SOCIAL";
type AppointmentStatus = "PENDING" | "CANCELED" | "DONE" | "IN_PROGRESS";

export interface Appointment {
  id: string;
  startDate: Date;
  endDate: Date;
  reason: string;

  status: AppointmentStatus;

  officeId: string;
  office: Office;

  userId: string;
  user: User;

  patientId: string;
  patient: Patient;

  type: AppointmentType;

  createdAt: Date;
  updatedAt: Date;

  patientTests: PatientTest[]
}

export interface AppointmentViewResponse {
  id: string;
  startDate: string; // ISO string UTC
  endDate: string; // ISO string UTC
  reason: string;
  status: AppointmentStatus;

  // Información del paciente
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
  };

  // Información del psicólogo
  user: {
    id: string;
    firstName: string;
    lastName: string;
    dni: string;
  };

  // Información del consultorio
  office: {
    id: string;
    name: string;
    type: string;
    capacity: number;
    location: {
      id: string;
      name: string;
      address: string;
    };
  };

  type: AppointmentType;

  createdAt: string;
  updatedAt: string;
}

export interface AppointmentEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  resource: AppointmentEventResource;
}

export interface AppointmentEventResource {
  id: string;
  officeName: string;
  psychologistName: string;
  patientName: string;
  status: AppointmentStatus;
}

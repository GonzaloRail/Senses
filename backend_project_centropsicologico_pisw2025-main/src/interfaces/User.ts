import { Appointment } from "./Appointment";
import { Document } from "./Document";
import { EmployeeLeave } from "./EmployeeLeave";
import { Evaluation } from "./Evaluation";
import { Patient } from "./Patient";
import { PatientTest } from "./PatientTest";
import { Test } from "./Test";
import { UserRole } from "./UserRole";
import { WorkSchedule } from "./WorkSchedule";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  email: string;
  password: string;
  csp?: string;
  isActive: boolean;

  psychologistId?: string;
  psychologist?: User;

  interns: User[];
  roles: UserRole[];
  patients: Patient[];
  workSchedule: WorkSchedule[];
  documents: Document[];
  appointments: Appointment[];
  employeeLeaves: EmployeeLeave[];
  createdTests: Test[];
  evaluations: Evaluation[];
  patientTests: PatientTest[];

  createdAt: Date;
  updatedAt: Date;
}

export type UserMinimal = Pick<User, "id" | "firstName" | "lastName" | "dni">;

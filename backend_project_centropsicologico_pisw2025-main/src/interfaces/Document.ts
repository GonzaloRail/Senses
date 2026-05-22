import { EmployeeLeave } from "./EmployeeLeave";
import { PatientTest } from "./PatientTest";
import { Test } from "./Test";
import { User } from "./User";

type DocumentType =
  | "CLINICAL_HISTORY"
  | "USER_DOCS"
  | "TEMPLATE"
  | "EVALUATION_TEST";

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;

  userId?: string;
  user?: User;

  testId?: string;
  test?: Test;

  patientTestId?: string;
  patientTest?: PatientTest;

  employeeLeaveId?: string;
  employeeLeave?: EmployeeLeave;

  createdAt: Date;
  updatedAt: Date;
}

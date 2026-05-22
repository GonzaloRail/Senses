import { Document } from "./Document";
import { Evaluation } from "./Evaluation";
import { PatientTest } from "./PatientTest";
import { User } from "./User";

export interface Test {
  id: string;
  name: string;
  description?: string;
  document?: Document;
  isActive: boolean;

  createdById: string;
  createdBy: User;

  evaluationId: string;
  evaluation: Evaluation;

  patientTests?: PatientTest[];

  createdAt: Date;
  updatedAt: Date;
}

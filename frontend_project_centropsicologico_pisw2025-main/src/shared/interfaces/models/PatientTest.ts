import type { ClinicalHistory } from "./ClinicalHistory";
import type { Document } from "./Document";
import type { Test } from "./Test";
import type { User } from "./User";

export interface PatientTest {
  id: string;

  testId: string;
  test: Test;

  clinicalHistoryId: string;
  clinicalHistory: ClinicalHistory;

  document?: Document;

  isGeneralDoc: boolean;

  completedById: string;
  completedBy: User;

  completedAt: Date;
  submissionMode?: "DOCUMENT" | "FORM";
  formSubmission?: {
    id: string;
    responseData: any;
  } | null;
}

import { Evaluation as EvaluationDB } from "@prisma/client";
import { Test } from "./Test";
import { User } from "./User";

export interface Evaluation {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdById: string;
  createdBy?: User;
  tests?: Test[];
  openNewSection: boolean;
  sectionOrder: number;

  createdAt: Date;
  updatedAt: Date;
}
export interface SectionToDoSort {
  id: string;
  name: string;
  order: number;
  isDefault: boolean;
  evaluationCount: number;
}

export interface Section {
  id: string;
  name: string;
  order: number;
  isDefault: boolean;
  evaluations: EvaluationDB[];
}

export enum EvaluationDefaultID {
  DEFAULT_ID = "DEFAULT_ID",
}

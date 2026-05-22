import { Document } from "./Document";
import { User } from "./User";

export interface EmployeeLeave {
  id: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isActive: boolean;

  document?: Document;

  userId: string;
  user: User;

  createdAt: Date;
  updatedAt: Date;
}

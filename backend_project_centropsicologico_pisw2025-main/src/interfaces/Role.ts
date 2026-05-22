import { UserRole } from "./UserRole";

type RoleType = "ADMIN" | "ADMISSION" | "PSYCHOLOGIST" | "INTERNAL";

export interface Role {
  id: string;
  name: RoleType;
  users: UserRole[];
}

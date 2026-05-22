import { Role } from "./Role";
import { User } from "./User";

export interface UserRole {
  userId: string;
  user: User;

  roleId: string;
  role: Role;
}

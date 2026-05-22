import { District } from "./District";
import { Office } from "./Office";

export interface Location {
  id: string;
  name: string;
  isActive: boolean;
  address: string;

  districtId: string;
  district: District;

  offices: Office[];

  createdAt: Date;
  updatedAt: Date;
}

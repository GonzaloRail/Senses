import { Location } from "./Location";
import { Patient } from "./Patient";
import { Province } from "./Province";

export interface District {
  id: string;
  name: string;

  provinceId: string;
  province: Province;

  locations: Location[];

  patients: Patient[];

  createdAt: Date;
  updatedAt: Date;
}

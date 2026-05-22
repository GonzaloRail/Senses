import { District } from "./District";
import { Region } from "./Region";

export interface Province {
  id: string;
  name: string;

  regionId: string;
  region: Region;

  districts: District[];

  createdAt: Date;
  updatedAt: Date;
}

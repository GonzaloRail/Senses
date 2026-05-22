import { Appointment } from "./Appointment";
import { ItemInstance } from "./ItemInstance";
import { Location } from "./Location";
import { WorkSchedule } from "./WorkSchedule";

export interface Office {
  id: string;
  name: string;
  type: string;
  capacity: number;
  isActive: boolean;

  locationId: string;
  location: Location;

  appointments: Appointment[];

  itemInstances: ItemInstance[];

  workShedules: WorkSchedule[];

  createdAt: Date;
  updatedAt: Date;
}

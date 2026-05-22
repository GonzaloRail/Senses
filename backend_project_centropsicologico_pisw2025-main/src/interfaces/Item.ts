import { ItemInstance } from "./ItemInstance";

export interface Item {
  id: string;
  name: string;
  quantity: number;
  description?: string;
  isActive: boolean;

  items: ItemInstance[];

  createdAt: Date;
  updatedAt: Date;
}

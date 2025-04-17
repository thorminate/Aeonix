import { InventoryEntry } from "../Inventory/inventoryUtils.js";
import { randomUUID } from "node:crypto";
import { ItemUsageContext, ItemUsageResult } from "./itemUtils.js";

export default class Item {
  id: string;
  name: string;
  type: string;
  description: string;
  weight: number;
  value: number;
  data: any;
  useType: string;

  constructor() {
    this.id = randomUUID();
  }

  createData() {
    throw new Error("Not implemented");
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    throw new Error("Not implemented");
  }

  toInventoryEntry<T extends Item>(
    this: T,
    quantity: number = 1
  ): InventoryEntry {
    return new InventoryEntry(
      this.name,
      this.id,
      quantity,
      this.weight,
      this.data,
      this.type
    );
  }
}

import InventoryEntry from "../inventory/utils/inventoryEntry.js";
import { randomUUID } from "node:crypto";
import ItemUsageContext from "./utils/itemUsageContext.js";
import ItemUsageResult from "./utils/itemUsageResult.js";
import ItemEventContext from "./utils/itemEventContext.js";
import ItemEventResult from "./utils/itemEventResult.js";

export default abstract class Item {
  id: string = randomUUID();
  abstract name: string;
  abstract type: string;
  abstract description: string;
  abstract weight: number;
  abstract value: number;
  abstract data: object;
  abstract useType: string;

  abstract createData(): object;
  abstract use(context: ItemUsageContext): Promise<ItemUsageResult>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDrop(context: ItemEventContext): ItemEventResult {
    return new ItemEventResult("", true);
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

export class TemplateItem extends Item {
  name: string = "";
  type: string = "";
  description: string = "";
  weight: number = 0;
  value: number = 0;
  data: object = {};
  useType: string = "Use";

  createData() {
    throw new Error("Not implemented");
    return {};
  }

  override async use(): Promise<ItemUsageResult> {
    throw new Error("Not implemented");
    return new ItemUsageResult("", false);
  }

  override toInventoryEntry<T extends Item>(
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

import { InventoryEntry } from "../../Inventory/inventoryUtils.js";
import Item from "../item.js";
import { ItemUsageContext, ItemUsageResult } from "../itemUtils.js";

export interface IBackpackData {
  capacity: number;
  entries: InventoryEntry[];
}

export default class BackpackItem extends Item {
  name: string = "Backpack";
  type: string = "BackpackItem";
  description: string = "A backpack.";
  weight: number = 10;
  value: number = 0;
  data: IBackpackData = this.createData();
  useType: string = "Open";

  createData(
    capacity: number = 20,
    entries: InventoryEntry[] = []
  ): IBackpackData {
    return {
      capacity,
      entries,
    };
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    return new ItemUsageResult("", true);
  }
}

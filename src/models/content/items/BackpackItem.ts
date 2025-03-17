import Item, { ItemUsageContext, ItemUsageResult } from "../../item/item.js";
import { InventoryEntry } from "../../player/inventory/inventory.js";

interface IBackpackData {
  capacity: number;
  entries: any[];
}

export default class BackpackItem extends Item {
  name: string;
  id: string;
  description: string;
  weight: number;
  value: number;
  data: IBackpackData;
  useType: string;

  createData(
    capacity: number = 20,
    entries: InventoryEntry[] = []
  ): IBackpackData {
    return {
      capacity,
      entries,
    };
  }

  constructor() {
    super();
    this.name = "Backpack";
    this.id = this.constructor.name;
    this.description = "A backpack.";
    this.weight = 10;
    this.value = 0;
    this.data = this.createData();
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    return new ItemUsageResult("", true);
  }
}

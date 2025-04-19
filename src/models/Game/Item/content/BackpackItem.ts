import { InventoryEntry } from "../../Inventory/inventoryUtils.js";
import Item from "../item.js";
import { ItemUsageContext, ItemUsageResult } from "../itemUtils.js";

export interface IBackpackData {
  capacity: number;
  entries: InventoryEntry[];
}

export default class BackpackItem extends Item {
  override name: string = "Backpack";
  override type: string = "BackpackItem";
  override description: string = "A backpack.";
  override weight: number = 10;
  override value: number = 0;
  override data: IBackpackData = this.createData();
  override useType: string = "Open";

  override createData(
    capacity: number = 20,
    entries: InventoryEntry[] = []
  ): IBackpackData {
    return {
      capacity,
      entries,
    };
  }

  override async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    const { player } = context;

    player.giveXpFromRange(5, 10);
    return new ItemUsageResult("Wow!", true);
  }
}

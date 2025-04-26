import InventoryEntry from "../../inventory/utils/inventoryEntry.js";
import Item from "../item.js";
import ItemEventContext from "../utils/itemEventContext.js";
import ItemEventResult from "../utils/itemEventResult.js";
import ItemUsageContext from "../utils/itemUsageContext.js";
import ItemUsageResult from "../utils/itemUsageResult.js";

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

  override onDrop(context: ItemEventContext): ItemEventResult {
    return new ItemEventResult("Your backpack took damage!", true);
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    const { player } = context;

    player.giveXpFromRange(5, 10);
    return new ItemUsageResult("Wow!", true);
  }
}

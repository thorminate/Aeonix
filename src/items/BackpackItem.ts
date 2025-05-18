import Item from "../models/item/item.js";
import ItemEventResult from "../models/item/utils/itemEventResult.js";
import ItemReference from "../models/item/utils/itemReference.js";
import ItemUsageContext from "../models/item/utils/itemUsageContext.js";
import ItemUsageResult from "../models/item/utils/itemUsageResult.js";

export interface IBackpackData {
  capacity: number;
  entries: ItemReference[];
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
    entries: ItemReference[] = []
  ): IBackpackData {
    return {
      capacity,
      entries,
    };
  }

  override onDrop(): ItemEventResult {
    return new ItemEventResult("Your backpack took damage!", true);
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    const { player } = context;

    player.giveXpFromRange(5, 10);
    return new ItemUsageResult("Wow!", true);
  }
}

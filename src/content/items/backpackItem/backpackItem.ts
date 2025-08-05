import Item from "../../../models/item/item.js";
import ItemEventResult from "../../../models/item/utils/itemEventResult.js";
import ItemUsageContext from "../../../models/item/utils/itemUsageContext.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";

export interface IBackpackData {
  capacity: number;
  entries: Item[];
}

export default class BackpackItem extends Item {
  type: string = "backpackItem";
  name: string = "Backpack";
  description: string = "A backpack.";
  weight: number = 10;
  value: number = 0;
  data: IBackpackData = this.createData();
  useType: string = "Open";

  createData(capacity: number = 20, entries: Item[] = []): IBackpackData {
    return {
      capacity,
      entries,
    };
  }

  override onDrop(): ItemEventResult {
    return new ItemEventResult("Your backpack took damage!", true);
  }

  async use({ player }: ItemUsageContext): Promise<ItemUsageResult> {
    await player.use(async (p) => {
      p.stats.giveXpFromRange(5, 10);
    });
    return new ItemUsageResult("Wow!", true);
  }
}

import Item from "../../models/item/item.js";
import ItemUsageContext from "../../models/item/utils/itemUsageContext.js";
import ItemUsageResult from "../../models/item/utils/itemUsageResult.js";

interface ISwordData {
  range: number;
  damage: number;
  wear: number;
}

export default class SwordItem extends Item {
  name: string = "Sword";
  type: string = "swordItem";
  description: string = "A sword.";
  weight: number = 15;
  value: number = 0;
  data: ISwordData = this.createData();
  useType: string = "Swing";
  createData(): ISwordData {
    return {
      range: 5,
      damage: 10,
      wear: 0,
    };
  }
  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    this.data.wear++;
    return new ItemUsageResult("Sword Swung!", true);
  }
}

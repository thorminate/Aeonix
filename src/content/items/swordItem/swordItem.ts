import Item from "../../../models/item/item.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";

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
  interactionType: string = "Swing";
  interactable: boolean = true;
  oneTimeInteraction: boolean = false;
  canDrop: boolean = true;

  createData(): ISwordData {
    return {
      range: 5,
      damage: 10,
      wear: 0,
    };
  }
  async use(): Promise<ItemUsageResult> {
    if (this.data.wear >= 10) {
      this.interactable = false;
      return new ItemUsageResult("Your sword broke!", true);
    }

    this.data.wear++;

    return new ItemUsageResult("Sword Swung!", true);
  }
}

import Item from "../../../models/item/item.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";

interface ISwordData {
  range: number;
  damage: number;
  wear: number;
}

export default class SwordItem extends Item<ISwordData> {
  name: string = "Sword";
  type: string = "swordItem";
  description: string = "A sword.";
  weight: number = 15;
  value: number = 0;
  interactionType: string = "Swing";
  interactable: boolean = true;
  oneTimeInteraction: boolean = false;
  canDrop: boolean = true;

  async use(): Promise<ItemUsageResult> {
    if (this.data.wear >= 10) {
      this.interactable = false;
      return new ItemUsageResult("Your sword broke!", true);
    }

    this.data.wear++;

    return new ItemUsageResult("Sword Swung!", true);
  }
}

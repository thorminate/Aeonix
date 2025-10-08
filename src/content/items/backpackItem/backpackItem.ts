import Item from "../../../models/item/item.js";
import ItemEventResult from "../../../models/item/utils/itemEventResult.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";
import Player from "../../../models/player/player.js";

export interface IBackpackData {
  capacity: number;
  entries: Item[];
}

export default class BackpackItem extends Item<IBackpackData> {
  type: string = "backpackItem";
  name: string = "Backpack";
  description: string = "A backpack.";
  weight: number = 10;
  value: number = 0;
  interactionType: string = "Open";
  interactable: boolean = true;
  oneTimeInteraction: boolean = true;
  canDrop: boolean = true;

  override onDrop(): ItemEventResult {
    return new ItemEventResult("Your backpack took damage!", true);
  }

  async use(player: Player): Promise<ItemUsageResult> {
    this.interactionType = "Opened";
    player.stats.giveXpFromRange(5, 10);
    return new ItemUsageResult("Wow!", true);
  }
}

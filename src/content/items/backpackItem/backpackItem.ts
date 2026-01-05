import Item from "#item/item.js";
import ItemEventResult from "#item/utils/itemEventResult.js";
import ItemUsageResult from "#item/utils/itemUsageResult.js";
import Player from "#player/player.js";

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

  override async onDrop(): Promise<ItemEventResult> {
    return new ItemEventResult("Your backpack took damage!", true);
  }

  override async onInteract(player: Player): Promise<ItemUsageResult> {
    this.interactionType = "Opened";
    player.stats.giveXpFromRange(5, 10);
    return new ItemUsageResult("Wow!", true);
  }
}

import ItemReference from "../../item/utils/itemReference.js";
import Player from "../player.js";

// ABANDONED UNTIL FURTHER NOTICE

export default class Quest {
  public id: string = "";
  public name: string = "";
  public description: string = "";
  public xpReward: number = 0;
  public itemReward: ItemReference[] = [];
  public completed: boolean = false;

  constructor(
    id: string,
    name: string,
    description: string,
    xpReward?: number,
    itemReward?: ItemReference[]
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.xpReward = xpReward ?? 0;
    this.itemReward = itemReward ?? [];
  }

  async fulfill(player: Player) {
    this.completed = true;
    player.giveXp(this.xpReward);
    for (const item of this.itemReward) {
      player.inventory.add(item);
    }

    player.save().catch((e) => {
      console.error("Error saving player after quest fulfillment:", e);
    });
  }
}

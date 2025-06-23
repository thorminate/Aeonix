// ABANDONED UNTIL FURTHER NOTICE

import ItemReference from "../../../item/utils/itemReference.js";
import Player from "../../player.js";

export default class Quest {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  itemReward: ItemReference[];
  completed: boolean;

  constructor(
    id: string = "",
    name: string = "",
    description: string = "",
    xpReward: number = 0,
    itemReward: ItemReference[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.xpReward = xpReward ?? 0;
    this.itemReward = itemReward ?? [];
    this.completed = false;
  }

  async fulfill(player: Player) {
    this.completed = true;
    player.stats.giveXp(this.xpReward);
    for (const item of this.itemReward) {
      player.inventory.add(item);
    }

    player.commit().catch((e) => {
      console.error("Error saving player after quest fulfillment:", e);
    });
  }
}

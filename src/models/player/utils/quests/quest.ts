// ABANDONED UNTIL FURTHER NOTICE

import Player from "../../player.js";

export default class Quest {
  id: string = "";
  name: string = "";
  description: string = "";
  completed: boolean = false;

  async fulfill(player: Player) {
    this.completed = true;

    if (this.onFulfill) this.onFulfill(player);

    player.commit().catch((e) => {
      console.error("Error saving player after quest fulfillment:", e);
    });
  }

  onFulfill?(player: Player): void;
}

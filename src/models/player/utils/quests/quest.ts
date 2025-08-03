// ABANDONED UNTIL FURTHER NOTICE

import { randomUUID } from "crypto";
import Player from "../../player.js";

export default abstract class Quest {
  id: string = randomUUID();
  abstract type: string;
  abstract name: string;
  abstract description: string;
  completed: boolean = false;

  async fulfill(player: Player) {
    this.completed = true;

    if (this.onFulfill) this.onFulfill(player);

    //await player.commit()
  }

  abstract onFulfill(player: Player): void;
}

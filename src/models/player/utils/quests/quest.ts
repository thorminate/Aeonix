// ABANDONED UNTIL FURTHER NOTICE

import { randomUUID } from "crypto";
import Player from "../../player.js";

export interface RawQuest {
  0: string; // id
  1: string; // type
  2: boolean; // completed
}

export default abstract class Quest {
  id: string = randomUUID();
  abstract type: string;
  abstract name: string;
  abstract description: string;
  completed: boolean = false;

  async fulfill(player: Player) {
    this.completed = true;

    if (this.onFulfill) this.onFulfill(player);
  }

  abstract onFulfill(player: Player): void;

  toRaw(): RawQuest {
    return {
      0: this.id,
      1: this.type,
      2: this.completed,
    };
  }
}

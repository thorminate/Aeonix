import { randomUUID } from "crypto";
import Player from "../../player.js";
import { AnyQuestEvent } from "./questEvents.js";

export interface RawQuest {
  0: string; // id
  1: string; // type
  2: boolean; // completed
  3: object | undefined; // data
}

export default abstract class Quest<Data extends object = object> {
  id: string = randomUUID();
  abstract type: string;
  abstract name: string;
  abstract description: string;
  completed: boolean = false;
  data?: Data;

  constructor(data?: Data) {
    this.data = data;
  }

  async fulfill(player: Player) {
    this.completed = true;

    if (this.onFulfill) this.onFulfill(player);
  }

  abstract onEvent(event: AnyQuestEvent, player: Player): void;

  abstract onFulfill(player: Player): void;

  toRaw(): RawQuest {
    return {
      0: this.id,
      1: this.type,
      2: this.completed,
      3: this.data,
    };
  }
}

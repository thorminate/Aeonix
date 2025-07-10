// ABANDONED UNTIL FURTHER NOTICE

import { randomUUID } from "crypto";
import Player from "../player.js";

export default abstract class Quest {
  private _id: string = "";
  abstract type: string;
  abstract name: string;
  abstract description: string;
  completed: boolean = false;

  get id() {
    if (!this._id) this._id = randomUUID();
    return this._id;
  }

  async fulfill(player: Player) {
    this.completed = true;

    if (this.onFulfill) this.onFulfill(player);

    player.commit().catch((e) => {
      console.error("Error saving player after quest fulfillment:", e);
    });
  }

  abstract onFulfill(player: Player): void;
}

import { randomUUID } from "node:crypto";
import Player from "../../player.js";

export interface RawStatusEffect {
  0: string; // id
  1: string; // type
  2: number; // exposure
}

export default abstract class StatusEffect {
  private _id: string = "";
  abstract type: string;
  abstract name: string;
  abstract description: string;
  abstract duration: number; // Duration in turns
  abstract isPermanent: boolean;
  exposure: number = 0;

  get id() {
    if (!this._id) this._id = randomUUID();
    return this._id;
  }

  start(player: Player) {
    this.exposure = 0;
    this.onEffectStart(player);
  }

  tick(player: Player) {
    this.exposure += 1;
    if (this.exposure >= this.duration) {
      this.end(player);
    }
  }

  end(player: Player) {
    this.onEffectEnd(player);
  }

  abstract onEffectStart(player: Player): Player;
  abstract onEffectTick(player: Player): Player;
  abstract onEffectEnd(player: Player): Player;

  toRaw(): RawStatusEffect {
    return {
      0: this.id,
      1: this.type,
      2: this.exposure,
    };
  }
}

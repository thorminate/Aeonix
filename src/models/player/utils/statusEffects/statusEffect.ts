import { randomUUID } from "node:crypto";
import Player from "../player.js";

export default abstract class StatusEffect {
  private _id: string = "";
  abstract type: string;
  abstract name: string;
  abstract description: string;
  abstract duration: number; // Duration in turns
  abstract isPermanent: boolean;

  get id() {
    if (!this._id) this._id = randomUUID();
    return this._id;
  }

  abstract onEffectStart(player: Player): Player;
  abstract onEffectTick(player: Player): Player;
  abstract onEffectEnd(player: Player): Player;
}

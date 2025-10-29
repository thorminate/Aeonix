import { randomUUID } from "node:crypto";
import Player from "../../player.js";
import Serializable, { Fields } from "../../../core/serializable.js";

export interface RawStatusEffect {
  id: string;
  type: string;
  exposure: number;
  data?: object;
}

const v1: Fields<StatusEffect> = {
  version: 1,
  shape: {
    id: { id: 0, type: String },
    type: { id: 1, type: String },
    exposure: { id: 2, type: Number },
    data: { id: 3, type: Object },
  },
} as const;

export default abstract class StatusEffect<
  Data = object
> extends Serializable<RawStatusEffect> {
  version = 1;
  fields = [v1];
  migrators = [];

  id: string = randomUUID();
  abstract type: string;
  abstract name: string;
  abstract description: string;
  abstract duration: number; // Duration in turns
  abstract isPermanent: boolean;
  exposure: number = 0;
  data?: Data;

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

  constructor(data?: Data) {
    super();
    this.data = data;
  }
}

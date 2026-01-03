import { randomUUID } from "node:crypto";
import Player from "../../player.js";
import Serializable, {
  baseFields,
  defineField,
} from "../../../core/serializable.js";

export interface RawStatusEffect {
  id: string;
  type: string;
  exposure: number;
  data?: object;
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 1, type: String },
    type: { id: 2, type: String },
    exposure: { id: 3, type: Number },
    data: { id: 4, type: Object },
  },
});

export default abstract class StatusEffect<
  Data = object
> extends Serializable<RawStatusEffect> {
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

import { randomUUID } from "node:crypto";
import Player from "#player/player.js";
import Serializable, { baseFields, defineField } from "#core/serializable.js";
import { AnyPlayerEvent } from "#player/utils/playerEvents.js";

export interface RawStatusEffect {
  id: string;
  type: string;
  exposure: number;
  data?: object;
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 0, type: String },
    type: { id: 1, type: String },
    exposure: { id: 2, type: Number },
    data: { id: 3, type: Object },
  },
});

export default abstract class StatusEffect<
  Data = object
> extends Serializable<RawStatusEffect> {
  fields = [v1];
  migrators = [];
  static override requiredFields = [
    "name",
    "description",
    "duration",
    "isPermanent",
    "onEffectStart",
    "onEffectTick",
    "onEffectEnd",
    "onEvent",
  ];

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

  abstract onEffectStart(player: Player): void;
  abstract onEffectTick(player: Player): void;
  abstract onEffectEnd(player: Player): void;

  abstract onEvent(event: AnyPlayerEvent): void;

  constructor(data?: Data) {
    super();
    this.data = data;
  }
}

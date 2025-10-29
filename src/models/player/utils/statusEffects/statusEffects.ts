import { arrayOf } from "../../../core/serializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import StatusEffect, { RawStatusEffect } from "./statusEffect.js";

export interface RawStatusEffects {
  effects: RawStatusEffect[];
}

const v1 = {
  version: 1,
  shape: {
    effects: { id: 0, type: arrayOf(Object) },
  },
} as const;

export default class StatusEffects extends PlayerSubclassBase<RawStatusEffects> {
  version: number = 1;
  fields = [v1];
  migrators = [];

  effects: StatusEffect[] = [];
}

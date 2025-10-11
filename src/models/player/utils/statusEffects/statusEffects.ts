import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { arrayOf, FieldSchema } from "../../../core/versionedSerializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import StatusEffect, { RawStatusEffect } from "./statusEffect.js";

export interface RawStatusEffects {
  effects: RawStatusEffect[];
}

export default class StatusEffects extends PlayerSubclassBase<RawStatusEffects> {
  version: number = 1;
  fields = {
    effects: { id: 0, type: arrayOf(Number) },
  } satisfies FieldSchema<RawStatusEffects>;
  effects: StatusEffect[] = [];

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      effects: StatusEffect as ConcreteConstructor<StatusEffect>,
    };
  }
}

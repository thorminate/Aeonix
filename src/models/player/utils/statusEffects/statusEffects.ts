import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import StatusEffect, { RawStatusEffect } from "./statusEffect.js";

export interface RawStatusEffects {
  0: RawStatusEffect[];
}

export default class StatusEffects extends PlayerSubclassBase {
  effects: StatusEffect[] = [];

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      effects: StatusEffect as ConcreteConstructor<StatusEffect>,
    };
  }
}

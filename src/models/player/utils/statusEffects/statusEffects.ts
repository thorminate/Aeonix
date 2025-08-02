import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../types/playerSubclassBase.js";
import StatusEffect from "./statusEffect.js";

export default class StatusEffects extends PlayerSubclassBase {
  effects: StatusEffect[] = [];

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      effects: StatusEffect as ConcreteConstructor<StatusEffect>,
    };
  }

  constructor() {
    super();
  }
}

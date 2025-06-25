import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import StatusEffect from "./statusEffect.js";

export default class StatusEffects extends PlayerSubclassBase {
  effects: StatusEffect[] = [];

  getClassMap(): Record<string, new (...args: any) => any> {
    return {
      effects: StatusEffect,
    };
  }

  constructor() {
    super();
  }
}

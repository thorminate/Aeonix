import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import calculateXpRequirement from "./calculateXpRequirement.js";

export default class Stats extends PlayerSubclassBase {
  level: number = 1;
  xp: number = 0;
  maxHealth: number = 100;
  health: number = 100;
  strength: number = 0;
  will: number = 0;
  cognition: number = 0;
  hasNausea: boolean = false;

  levelUp(amount: number = 1, resetXp: boolean = true) {
    if (amount <= 0 || !amount) return;
    this.level += amount;
    if (resetXp) this.xp = 0;
  }

  giveXp(amount: number) {
    this.xp += amount;
    while (this.xp >= calculateXpRequirement(this.level)) {
      this.levelUp(1, false);
      this.xp -= calculateXpRequirement(this.level - 1);
    }

    if (this.xp < 0) this.xp = 0;
  }

  giveXpFromRange(min: number, max: number) {
    const randomFromRange = Math.floor(Math.random() * (max - min + 1)) + min;

    this.giveXp(randomFromRange);
  }

  getClassMap(): Record<string, new (...args: any) => any> {
    return {};
  }
}

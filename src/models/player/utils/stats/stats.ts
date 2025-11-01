import { baseFields, defineField } from "../../../core/serializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import calculateXpRequirement from "./calculateXpRequirement.js";

export interface RawStats {
  level: number; // level
  xp: number; // xp
  maxHealth: number; // maxHealth
  health: number; // health
  strength: number; // strength
  will: number; // will
  cognition: number; // cognition
  hasNausea: boolean; // hasNausea
  hasCompletedTutorial: boolean; // hasCompletedTutorial
}

const v1 = defineField(baseFields, {
  add: {
    level: { id: 1, type: Number },
    xp: { id: 2, type: Number },
    maxHealth: { id: 3, type: Number },
    health: { id: 4, type: Number },
    strength: { id: 5, type: Number },
    will: { id: 6, type: Number },
    cognition: { id: 7, type: Number },
    hasNausea: { id: 8, type: Boolean },
    hasCompletedTutorial: { id: 9, type: Boolean },
  },
});

export default class Stats extends PlayerSubclassBase<RawStats> {
  fields = [v1];
  migrators = [];

  level: number = 1;
  xp: number = 0;
  maxHealth: number = 100;
  health: number = 100;
  strength: number = 0;
  will: number = 0;
  cognition: number = 0;
  hasNausea: boolean = false;
  hasCompletedTutorial: boolean = false;

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
}

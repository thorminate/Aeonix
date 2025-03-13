export interface IStats {
  level: number;
  xp: number;
  strength: number;
  will: number;
  cognition: number;
}

export default class Stats implements IStats {
  level: number;
  xp: number;
  strength: number;
  will: number;
  cognition: number;

  constructor(
    level: number = 1,
    xp: number = 0,
    strength: number = 0,
    will: number = 0,
    cognition: number = 0
  ) {
    this.level = level;
    this.xp = xp;
    this.strength = strength;
    this.will = will;
    this.cognition = cognition;
  }
}

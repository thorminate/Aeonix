export interface IStats {
  level: number;
  xp: number;
  strength: number;
  will: number;
  cognition: number;
}

export default class Stats implements IStats {
  level: number = 1;
  xp: number = 0;
  maxHealth: number = 100;
  health: number = 100;
  strength: number = 0;
  will: number = 0;
  cognition: number = 0;
  hasNausea: boolean = false;
}

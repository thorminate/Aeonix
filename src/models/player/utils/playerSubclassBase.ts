import Player from "../player.js";

export abstract class PlayerSubclassBase {
  parent: Player;
  abstract getClassMap(): Record<string, new (...args: unknown[]) => unknown>;

  constructor(parent: Player) {
    this.parent = parent;
  }
}

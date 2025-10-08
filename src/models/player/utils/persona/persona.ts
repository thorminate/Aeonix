import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawPersona {
  0: string; // name
  1: string; // avatar
}

export default class Persona extends PlayerSubclassBase {
  name: string;
  avatar: string;

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }

  constructor(player: Player, name: string = "", avatar: string = "") {
    super(player);

    this.name = name;
    this.avatar = avatar;
  }
}

import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawPersona {
  name: string; // name
  avatar: string; // avatar
}

export default class Persona extends PlayerSubclassBase<RawPersona> {
  version: number = 1;
  fields = {
    name: { id: 0, type: String }, // name
    avatar: { id: 1, type: String }, // avatar
  };
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

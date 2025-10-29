import { Fields } from "../../../core/serializable.js";
import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawPersona {
  name: string; // name
  avatar: string; // avatar
}

const v1: Fields<RawPersona> = {
  version: 1,
  shape: {
    name: { id: 0, type: String },
    avatar: { id: 1, type: String },
  },
};

export default class Persona extends PlayerSubclassBase<RawPersona> {
  version: number = 1;
  fields = [v1];
  migrators = [];

  name: string;
  avatar: string;

  constructor(player: Player, name: string = "", avatar: string = "") {
    super(player);

    this.name = name;
    this.avatar = avatar;
  }
}

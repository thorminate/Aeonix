import { PlayerSubclassBase } from "../utils/playerSubclassBase.js";

export default class Persona extends PlayerSubclassBase {
  name: string;
  avatar: string;

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }

  constructor(name: string = "", avatar: string = "") {
    super();

    this.name = name;
    this.avatar = avatar;
  }
}

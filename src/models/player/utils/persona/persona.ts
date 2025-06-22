import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";

export default class Persona extends PlayerSubclassBase {
  name: string;
  avatar: string;

  getClassMap(): Record<string, new (...args: any) => any> {
    return {};
  }

  constructor(name: string = "", avatar: string = "") {
    super();

    this.name = name;
    this.avatar = avatar;
  }
}

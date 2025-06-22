import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Letter from "./letter.js";

export default class Inbox extends PlayerSubclassBase {
  letters: Letter[];

  getClassMap(): Record<string, new (...args: any) => any> {
    return {
      letters: Letter,
    };
  }

  constructor() {
    super();

    this.letters = [];
  }
}

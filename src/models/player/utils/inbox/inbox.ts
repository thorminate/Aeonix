import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../types/playerSubclassBase.js";
import Letter from "./letter.js";

export default class Inbox extends PlayerSubclassBase {
  letters: Letter[] = [];

  add(letter: Letter): void {
    this.letters.push(letter);
  }

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      letters: Letter as ConcreteConstructor<Letter>,
    };
  }
}

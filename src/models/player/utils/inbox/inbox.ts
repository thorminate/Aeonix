import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Letter from "./letter.js";

export default class Inbox extends PlayerSubclassBase {
  letters: Letter[] = [];

  add(letter: Letter): void {
    this.letters.push(letter);
  }

  read(letterId: string): Letter | undefined {
    const letter = this.letters.find((l) => l.id === letterId);

    if (!letter) return;

    this.letters = this.letters.map((l) =>
      l.id === letterId ? ({ ...l, isRead: true } as Letter) : l
    );

    return letter;
  }

  archive(letterId: string): Letter | undefined {
    const letter = this.letters.find((l) => l.id === letterId);

    if (!letter) return;

    this.letters = this.letters.map((l) =>
      l.id === letterId ? ({ ...l, isArchived: true } as Letter) : l
    );

    return letter;
  }

  unarchive(letterId: string): Letter | undefined {
    const letter = this.letters.find((l) => l.id === letterId);

    if (!letter) return;

    this.letters = this.letters.map((l) =>
      l.id === letterId ? ({ ...l, isArchived: false } as Letter) : l
    );

    return letter;
  }

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      letters: Letter as ConcreteConstructor<Letter>,
    };
  }
}

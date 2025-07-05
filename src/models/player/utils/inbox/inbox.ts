import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Letter from "./letter.js";

export default class Inbox extends PlayerSubclassBase {
  letters: Letter[] = [];

  addLetter(letter: Letter): void {
    this.letters.push(letter);
  }

  readLetter(letterId: string): Letter | undefined {
    const letter = this.letters.find((l) => l.id === letterId);

    if (!letter) return;

    this.letters = this.letters.map((l) =>
      l.id === letterId ? ({ ...l, isRead: true } as Letter) : l
    );

    return letter;
  }

  archiveLetter(letterId: string): Letter | undefined {
    const letter = this.letters.find((l) => l.id === letterId);

    if (!letter) return;

    this.letters = this.letters.map((l) =>
      l.id === letterId ? ({ ...l, isArchived: true } as Letter) : l
    );

    return letter;
  }

  unarchiveLetter(letterId: string): Letter | undefined {
    const letter = this.letters.find((l) => l.id === letterId);

    if (!letter) return;

    this.letters = this.letters.map((l) =>
      l.id === letterId ? ({ ...l, isArchived: false } as Letter) : l
    );

    return letter;
  }

  getClassMap(): Record<string, object> {
    return {
      letters: Letter as object,
    };
  }
}

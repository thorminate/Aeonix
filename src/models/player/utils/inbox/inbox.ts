import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Letter from "./letter.js";

export default class Inbox extends PlayerSubclassBase {
  unread: Letter[];
  read: Letter[];
  archived: Letter[];

  addLetter(letter: Letter): void {
    this.unread.push(letter);
  }

  readLetter(letterId: string): Letter | undefined {
    const letter = this.unread.find((l) => l.id === letterId);

    if (!letter) return;

    this.unread = this.unread.filter((l) => l !== letter);
    this.read.push(letter);

    return letter;
  }

  archiveLetter(letterId: string): Letter | undefined {
    let letter = this.read.find((l) => l.id === letterId);

    if (!letter) {
      letter = this.unread.find((l) => l.id === letterId);

      if (!letter) return;

      this.unread = this.unread.filter((l) => l !== letter);
      this.archived.push(letter);

      return letter;
    }

    this.read = this.read.filter((l) => l !== letter);
    this.archived.push(letter);

    return letter;
  }

  unarchiveLetter(letterId: string): Letter | undefined {
    const letter = this.archived.find((l) => l.id === letterId);

    if (!letter) return;

    this.archived = this.archived.filter((l) => l !== letter);
    this.read.push(letter);

    return letter;
  }

  getClassMap(): Record<string, new (...args: any) => any> {
    return {
      letters: Letter,
    };
  }

  constructor() {
    super();

    this.unread = [];
    this.read = [];
    this.archived = [];
  }
}

import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Letter from "./letter.js";

export default class Inbox extends PlayerSubclassBase {
  unread: Letter[];
  read: Letter[];
  archived: Letter[];

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

import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Quest from "./quest.js";

export default class QuestLog extends PlayerSubclassBase {
  active: Quest[];
  completed: Quest[];
  pending: Quest[];

  getClassMap(): Record<string, new (...args: any) => any> {
    return {
      active: Quest,
      completed: Quest,
      pending: Quest,
    };
  }

  constructor() {
    super();

    this.active = [];
    this.completed = [];
    this.pending = [];
  }
}

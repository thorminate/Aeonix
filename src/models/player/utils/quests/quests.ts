import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Quest from "./quest.js";

export default class Quests extends PlayerSubclassBase {
  completed: Quest[] = [];
  pending: Quest[] = [];

  append(quest: Quest) {
    this[quest.completed ? "completed" : "pending"].push(quest);
  }

  getClassMap(): Record<string, object> {
    return {
      active: Quest,
      completed: Quest,
      pending: Quest,
    };
  }

  constructor() {
    super();
  }
}

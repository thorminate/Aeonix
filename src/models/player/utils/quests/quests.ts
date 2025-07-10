import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";
import Quest from "./quest.js";

export default class Quests extends PlayerSubclassBase {
  completed: Quest[] = [];
  pending: Quest[] = [];

  append(quest: Quest) {
    this[quest.completed ? "completed" : "pending"].push(quest);
  }

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      completed: Quest as ConcreteConstructor<Quest>,
      pending: Quest as ConcreteConstructor<Quest>,
    };
  }

  constructor() {
    super();
  }
}

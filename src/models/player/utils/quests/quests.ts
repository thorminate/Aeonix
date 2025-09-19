import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../utils/playerSubclassBase.js";
import Quest from "./quest.js";

export default class Quests extends PlayerSubclassBase {
  quests: Quest[] = [];

  append(quest: Quest) {
    this.quests.push(quest);
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

import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import Quest, { RawQuest } from "./quest.js";
import { AnyQuestEvent } from "./questEvents.js";

export interface RawQuests {
  0: RawQuest[]; // quests
}

export default class Quests extends PlayerSubclassBase {
  quests: Quest[] = [];

  append(quest: Quest) {
    this.quests.push(quest);
  }

  callEvent(event: AnyQuestEvent) {
    this.quests.forEach((quest) => quest.onEvent(event, this.parent));
  }

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      completed: Quest as ConcreteConstructor<Quest>,
      pending: Quest as ConcreteConstructor<Quest>,
    };
  }
}

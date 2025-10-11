import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { arrayOf, FieldSchema } from "../../../core/versionedSerializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import Quest, { RawQuest } from "./quest.js";
import { AnyQuestEvent } from "./questEvents.js";

export interface RawQuests {
  quests: RawQuest[]; // quests
}

export default class Quests extends PlayerSubclassBase<RawQuests> {
  version = 1;
  fields = {
    quests: { id: 0, type: arrayOf(Object) },
  } satisfies FieldSchema<RawQuests>;
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

import aeonix from "../../../../index.js";
import { ClassConstructor } from "../../../../utils/typeDescriptor.js";
import { dynamicArrayOf } from "../../../core/serializable.js";
import Letter from "../inbox/letter.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import Quest, { RawQuest } from "./quest.js";
import { AnyQuestEvent } from "./questEvents.js";

export interface RawQuests {
  quests: RawQuest[]; // quests
}

const v1 = {
  version: 1,
  shape: {
    quests: {
      id: 0,
      type: dynamicArrayOf(async (o) => {
        if (
          !o ||
          !(typeof o === "object") ||
          !("d" in o) ||
          !(typeof o.d === "object") ||
          !("1" in o.d!) ||
          !(typeof o.d[1] === "string")
        )
          return Quest as unknown as ClassConstructor;
        const cls = await aeonix.letters.loadRaw(o.d[1]);
        return cls ? cls : (Letter as unknown as ClassConstructor);
      }),
    },
  },
};

export default class Quests extends PlayerSubclassBase<RawQuests> {
  version = 1;
  fields = [v1];
  quests: Quest[] = [];
  migrators = [];

  append(quest: Quest) {
    this.quests.push(quest);
  }

  callEvent(event: AnyQuestEvent) {
    this.quests.forEach((quest) => quest.onEvent(event, this.parent));
  }
}

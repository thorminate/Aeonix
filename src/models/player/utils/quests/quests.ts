import aeonix from "../../../../index.js";
import { ClassConstructor } from "../../../../utils/typeDescriptor.js";
import {
  baseFields,
  defineField,
  dynamicArrayOf,
} from "../../../core/serializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import Quest, { RawQuest } from "./quest.js";

export interface RawQuests {
  quests: RawQuest[]; // quests
}

// TODO: add a discord command that lists and allows the player to interact with quests.
// TODO: make a discord event listener that adds an environment overview to the respective channel, should resend itself every time a new message appears in the channel to keep it at the bottom, should also update itself when something changes in the environment. (like a new item appears, or a new travel route appears)

const v1 = defineField(baseFields, {
  add: {
    quests: {
      id: 0,
      type: dynamicArrayOf(async (o) => {
        if (
          !o ||
          !(typeof o === "object") ||
          !("d" in o) ||
          !(typeof o.d === "object") ||
          !("2" in o.d!) ||
          !(typeof o.d[2] === "string")
        )
          return Quest as unknown as ClassConstructor;
        const cls = await aeonix.quests.loadRaw(o.d[2]);
        return cls ? cls : (Quest as unknown as ClassConstructor);
      }),
    },
  },
});

export default class Quests extends PlayerSubclassBase<RawQuests> {
  fields = [v1];
  quests: Quest[] = [];
  migrators = [];

  add(quest: Quest) {
    this.quests.push(quest);
    this.parent.emit("questAdded", quest);
  }

  remove(quest: Quest) {
    this.quests = this.quests.filter((q) => q.id !== quest.id);
    this.parent.emit("questRemoved", quest);
  }
}

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
  arr: RawQuest[]; // quests
}

// TODO: make an event system for environments to hook into, like, "playerJoined" or "itemDropped", this should also make the overview box update dynamically.

const v1 = defineField(baseFields, {
  add: {
    arr: {
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
  arr: Quest[] = [];
  migrators = [];

  add(quest: Quest) {
    this.arr.push(quest);
    this.parent.emit("questAdded", quest);
  }

  remove(quest: Quest) {
    this.arr = this.arr.filter((q) => q.id !== quest.id);
    this.parent.emit("questRemoved", quest);
  }
}

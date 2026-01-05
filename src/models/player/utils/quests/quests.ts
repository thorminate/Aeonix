import aeonix from "#root/index.js";
import {
  ClassConstructor,
  arrayOf,
  dynamicType,
} from "#utils/typeDescriptor.js";
import { baseFields, defineField } from "#core/serializable.js";
import { PlayerSubclassBase } from "#player/utils/playerSubclassBase.js";
import Quest, { RawQuest } from "#player/utils/quests/quest.js";

export interface RawQuests {
  arr: RawQuest[]; // quests
}

const v1 = defineField(baseFields, {
  add: {
    arr: {
      id: 0,
      type: arrayOf(
        dynamicType(async (o) => {
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
        })
      ),
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

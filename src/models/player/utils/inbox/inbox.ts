import aeonix from "../../../../index.js";
import ParentAwareSubArray from "../../../../utils/parentAwareSubArray.js";
import { ClassConstructor } from "../../../../utils/typeDescriptor.js";
import {
  baseFields,
  defineField,
  dynamicArrayOf,
} from "../../../core/serializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import Letter, { RawLetter } from "./letter.js";

export interface RawInbox {
  letters: RawLetter[];
}

const v1 = defineField(baseFields, {
  add: {
    letters: {
      id: 1,
      type: dynamicArrayOf(async (o: unknown) => {
        if (
          !o ||
          !(typeof o === "object") ||
          !("d" in o) ||
          !(typeof o.d === "object") ||
          !("2" in o.d!) ||
          !(typeof o.d[2] === "string")
        )
          return Letter as unknown as ClassConstructor;
        const cls = await aeonix.letters.loadRaw(o.d[2]);
        return cls ? cls : (Letter as unknown as ClassConstructor);
      }),
    },
  },
});

export default class Inbox extends PlayerSubclassBase<RawInbox> {
  version = 1;
  fields = [v1];
  migrators = [];

  letters: Letter[] = [];

  add(letter: Letter): void {
    (this.letters as Letter[]).push(letter);

    const notifications = new ParentAwareSubArray(
      this.letters as Letter[],
      (l) => l.isNotification === true
    );

    if (notifications.length > aeonix.config.maxNotifications) {
      notifications.splice(
        0,
        notifications.length - aeonix.config.maxNotifications
      );
    }
  }
}

export type CompressedInbox = Inbox & {
  letters: Buffer[];
};

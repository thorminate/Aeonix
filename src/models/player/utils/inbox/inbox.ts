import aeonix from "#root/index.js";
import ParentAwareSubArray from "#utils/parentAwareSubArray.js";
import {
  ClassConstructor,
  arrayOf,
  dynamicType,
} from "#utils/typeDescriptor.js";
import { baseFields, defineField } from "#core/serializable.js";
import { PlayerSubclassBase } from "#player/utils/playerSubclassBase.js";
import Letter, { RawLetter } from "#player/utils/inbox/letter.js";

export interface RawInbox {
  letters: RawLetter[];
}

const v1 = defineField(baseFields, {
  add: {
    letters: {
      id: 1,
      type: arrayOf(
        dynamicType(async (o: unknown) => {
          if (
            !o ||
            !(typeof o === "object") ||
            !("d" in o) ||
            !(typeof o.d === "object") ||
            !("1" in o.d!) ||
            !(typeof o.d[1] === "string")
          )
            return Letter as unknown as ClassConstructor;
          const cls = await aeonix.letters.loadRaw(o.d[1]);
          return cls ? cls : (Letter as unknown as ClassConstructor);
        })
      ),
    },
  },
});

export default class Inbox extends PlayerSubclassBase<RawInbox> {
  static override fields = [v1];
  static override migrators = [];

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

import aeonix from "../../../../index.js";
import ParentAwareSubArray from "../../../../utils/parentAwareSubArray.js";
import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { arrayOf, FieldSchema } from "../../../core/versionedSerializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import Letter, { RawLetter } from "./letter.js";

export interface RawInbox {
  letters: RawLetter[];
}

export default class Inbox extends PlayerSubclassBase<RawInbox> {
  version = 1;
  fields = {
    letters: { id: 0, type: arrayOf(Object) },
  } satisfies FieldSchema<RawInbox>;
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

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      letters: Letter as ConcreteConstructor<Letter>,
    };
  }
}

export type CompressedInbox = Inbox & {
  letters: Buffer[];
};

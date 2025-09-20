import aeonix from "../../../../index.js";
import ParentAwareSubArray from "../../../../utils/parentAwareSubArray.js";
import ConcreteConstructor from "../../../core/concreteConstructor.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import Letter from "./letter.js";

export default class Inbox extends PlayerSubclassBase {
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

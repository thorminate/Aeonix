import { PlayerSubclassBase } from "../types/playerSubclassBase.js";

export default class Settings extends PlayerSubclassBase {
  inboxShowArchived: boolean = false;
  inboxShowNotifications: boolean = false;

  override getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }
}

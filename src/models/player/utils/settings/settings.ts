import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawSettings {
  0: boolean; // inboxShowArchived
  1: boolean; // inboxShowNotifications
}

export default class Settings extends PlayerSubclassBase {
  inboxShowArchived: boolean = false;
  inboxShowNotifications: boolean = false;

  override getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }
}

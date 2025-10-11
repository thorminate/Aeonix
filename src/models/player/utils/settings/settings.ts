import { FieldSchema } from "../../../core/versionedSerializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawSettings {
  inboxShowArchived: boolean; // inboxShowArchived
  inboxShowNotifications: boolean; // inboxShowNotifications
}

export default class Settings extends PlayerSubclassBase<RawSettings> {
  version = 1;
  fields = {
    inboxShowArchived: { id: 0, type: Boolean }, // inboxShowArchived
    inboxShowNotifications: { id: 1, type: Boolean }, // inboxShowNotifications
  } satisfies FieldSchema<RawSettings>;
  inboxShowArchived: boolean = false;
  inboxShowNotifications: boolean = false;

  override getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }
}

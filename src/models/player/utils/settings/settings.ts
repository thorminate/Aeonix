import { Fields } from "../../../core/serializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawSettings {
  inboxShowArchived: boolean; // inboxShowArchived
  inboxShowNotifications: boolean; // inboxShowNotifications
}

const v1: Fields<RawSettings> = {
  version: 1,
  shape: {
    inboxShowArchived: { id: 0, type: Boolean }, // inboxShowArchived
    inboxShowNotifications: { id: 1, type: Boolean }, // inboxShowNotifications
  },
};

export default class Settings extends PlayerSubclassBase<RawSettings> {
  version = 1;
  fields = [v1];
  migrators = [];

  inboxShowArchived: boolean = false;
  inboxShowNotifications: boolean = false;
}

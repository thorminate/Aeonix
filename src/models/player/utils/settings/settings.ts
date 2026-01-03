import { baseFields, defineField } from "../../../core/serializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawSettings {
  inboxShowArchived: boolean; // inboxShowArchived
  inboxShowNotifications: boolean; // inboxShowNotifications
}

const v1 = defineField(baseFields, {
  add: {
    inboxShowArchived: { id: 1, type: Boolean },
    inboxShowNotifications: { id: 2, type: Boolean },
  },
});

export default class Settings extends PlayerSubclassBase<RawSettings> {
  fields = [v1];
  migrators = [];

  inboxShowArchived: boolean = false;
  inboxShowNotifications: boolean = false;
}

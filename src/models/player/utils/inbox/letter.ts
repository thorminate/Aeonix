import { randomUUID } from "crypto";
import Player from "#player/player.js";
import Serializable, { baseFields, defineField } from "#core/serializable.js";

export interface RawLetter {
  id: string; // id
  type: string; // type

  createdAt: number; // createdAt
  isRead: boolean; // isRead
  isArchived: boolean; // isArchived
  isInteracted: boolean; // isInteracted
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 0, type: String },
    type: { id: 1, type: String },
    createdAt: { id: 2, type: Number },
    isRead: { id: 3, type: Boolean },
    isArchived: { id: 4, type: Boolean },
    isInteracted: { id: 5, type: Boolean },
  },
});

export default abstract class Letter<
  Data extends Record<string, unknown> = Record<string, unknown>
> extends Serializable<RawLetter> {
  static override fields = [v1];
  static override migrators = [];
  static override serializerRoot = Letter;
  static override requiredFields = [
    "sender",
    "subject",
    "body",
    "interactable",
    "interactionType",
    "oneTimeInteraction",
    "isNotification",
  ];

  abstract type: string;
  abstract sender: string;
  abstract subject: string;
  abstract body: string;
  abstract interactable: boolean;
  abstract interactionType: string;
  abstract oneTimeInteraction: boolean;
  abstract canDismiss?: boolean;
  abstract isNotification: boolean;

  id: string = randomUUID();
  createdAt: number = Date.now();
  isRead: boolean = false;
  isArchived: boolean = false;
  isInteracted: boolean = false;
  data: Data;

  markRead(): void {
    this.isRead = true;
  }

  markUnread(): void {
    this.isRead = false;
  }

  archive(): void {
    this.isArchived = true;
  }

  unarchive(): void {
    this.isArchived = false;
  }

  markInteracted(): void {
    this.isInteracted = true;
  }

  markUninteracted(): void {
    this.isInteracted = false;
  }

  onRead?(player: Player): void;
  onInteract?(player: Player): void;

  constructor(data?: Data) {
    super();
    this.data = data || ({} as Data);
  }
}

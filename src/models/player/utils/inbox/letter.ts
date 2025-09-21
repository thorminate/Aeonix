import { randomUUID } from "crypto";
import Player from "../../player.js";

export interface RawLetter {
  0: string; // id
  1: string; // type

  2: number; // createdAt
  3: boolean; // isRead
  4: boolean; // isArchived
  5: boolean; // isInteracted
}

export default abstract class Letter {
  constructor(
    public id: string = randomUUID(),
    public createdAt: number = Date.now(),
    public isRead: boolean = false,
    public isArchived: boolean = false,
    public isInteracted: boolean = false
  ) {}

  abstract type: string;
  abstract sender: string;
  abstract subject: string;
  abstract body: string;
  abstract interactable: boolean;
  abstract interactionType: string;
  abstract oneTimeInteraction: boolean;
  abstract canDismiss?: boolean;
  abstract isNotification: boolean;

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

  toRaw(): RawLetter {
    return {
      0: this.id,
      1: this.type,
      2: this.createdAt,
      3: this.isRead,
      4: this.isArchived,
      5: this.isInteracted,
    };
  }
}

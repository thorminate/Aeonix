import { randomUUID } from "crypto";
import Player from "../../player.js";

export interface RawLetter {
  i: string;
  t: string;

  c: number;
  r: boolean;
  a: boolean;
  n: boolean;
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
      i: this.id,
      t: this.type,
      c: this.createdAt,
      r: this.isRead,
      a: this.isArchived,
      n: this.isInteracted,
    };
  }
}

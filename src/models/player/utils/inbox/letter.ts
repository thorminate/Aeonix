import { randomUUID } from "crypto";
import Player from "../../player.js";

export interface RawLetter {
  id: string;
  type: string;

  createdAt: number;
  isRead: boolean;
  isArchived: boolean;
  isInteracted: boolean;
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
      id: this.id,
      type: this.type,
      createdAt: this.createdAt,
      isRead: this.isRead,
      isArchived: this.isArchived,
      isInteracted: this.isInteracted,
    };
  }
}

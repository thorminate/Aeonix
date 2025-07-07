import { randomUUID } from "crypto";
import Player from "../../player.js";

export default abstract class Letter {
  private _id = "";
  abstract type: string;
  abstract sender: string;
  abstract subject: string;
  abstract body: string;
  abstract interactable: boolean;
  abstract interactionType: string;
  abstract canDismiss?: boolean;
  isRead = false;
  isArchived = false;

  get id() {
    if (!this._id) this._id = randomUUID();
    return this._id;
  }

  onRead?(player: Player): void;
  onInteract?(player: Player): void;
}

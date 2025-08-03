import { randomUUID } from "crypto";
import Player from "../../player.js";

export default abstract class Letter {
  id = randomUUID();
  abstract type: string;
  abstract sender: string;
  abstract subject: string;
  abstract body: string;
  abstract interactable: boolean;
  abstract interactionType: string;
  abstract oneTimeInteraction: boolean;
  abstract canDismiss?: boolean;
  isRead: boolean = false;
  isArchived: boolean = false;
  isInteracted: boolean = false;

  onRead?(player: Player): void;
  onInteract?(player: Player): void;
}

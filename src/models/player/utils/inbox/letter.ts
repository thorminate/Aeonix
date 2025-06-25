import { randomUUID } from "node:crypto";
import Player from "../../player.js";

export default class Letter {
  id: string = randomUUID();
  sender: string = "";
  subject: string = "";
  body: string = "";
  interactable: boolean = false;
  interactionType: string = "";
  canDismiss: boolean = true;

  onRead?(player: Player): void;
  onInteract?(player: Player): void;
}

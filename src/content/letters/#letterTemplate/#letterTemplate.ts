import Letter from "../../../models/player/utils/inbox/letter.js";

export default class LetterTemplate extends Letter {
  type: string = "#letterTemplate"; // should always be the exact same as the filename
  sender: string = "(unknown sender)";
  subject: string = "Template letter!!";
  body: string = "cheese";
  interactable: boolean = true;
  interactionType: string = "yes";
  canDismiss: boolean = true;
  oneTimeInteraction: boolean = true;
  isNotification: boolean = false;
}

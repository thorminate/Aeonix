import Letter from "../../../models/player/utils/inbox/letter.js";
import NotificationCategory from "./utils/notificationCategory.js";

export default abstract class Notification extends Letter {
  abstract category: NotificationCategory;
  type: string = "notificationTemplate";
  interactable: boolean = false;
  interactionType: string = "placeholder";
  canDismiss: boolean = true;
  oneTimeInteraction: boolean = false;
  isNotification: boolean = true;
}

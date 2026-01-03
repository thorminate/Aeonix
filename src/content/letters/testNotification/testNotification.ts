import Notification from "../notification/notification.js";
import { NotificationCategory } from "../notification/utils/notificationCategory.js";

export default class TestNotification extends Notification {
  override type: string = "testNotification";
  sender: string = "Test sender";
  subject: string = "Test subject";
  body: string = "Test body";
  category = NotificationCategory.General;
}

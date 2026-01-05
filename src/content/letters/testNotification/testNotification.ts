import Notification from "#letters/notification/notification.js";
import { NotificationCategory } from "#letters/notification/utils/notificationCategory.js";

export default class TestNotification extends Notification {
  override type: string = "testNotification";
  sender: string = "Test sender";
  subject: string = "Test subject";
  body: string = "Test body";
  category = NotificationCategory.General;
}

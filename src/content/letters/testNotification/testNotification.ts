import NotificationTemplate from "../notificationTemplate/notificationTemplate.js";
import { NotificationCategory } from "../notificationTemplate/utils/notificationCategory.js";

export default class TestNotification extends NotificationTemplate {
  override type: string = "testNotification";
  sender: string = "Test sender";
  subject: string = "Test subject";
  body: string = "Test body";
  category = NotificationCategory.General;
}

import TNotificationCategory from "../../../../content/letters/notification/utils/notificationCategory.js";

export default function notificationCategoryToColor(
  category: TNotificationCategory
) {
  switch (category) {
    case "system":
      return 0x5865f2; // Discord blurple
    case "quest":
      return 0x57f287; // green
    case "warning":
      return 0xed4245; // red
    case "event":
      return 0xfaa61a; // orange
    default:
      return 0x2f3136; // neutral gray
  }
}

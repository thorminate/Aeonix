type TNotificationCategory =
  | "quest"
  | "event"
  | "general"
  | "warning"
  | "system";

export default TNotificationCategory;

export enum NotificationCategory {
  System = "system",
  Quest = "quest",
  Event = "event",
  General = "general",
  Warning = "warning",
}

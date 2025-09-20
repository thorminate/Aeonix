import {
  ContainerBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextDisplayBuilder,
} from "discord.js";
import Notification from "../../../../content/letters/notification/notification.js";
import notificationCategoryToColor from "./notificationCategoryToColor.js";

export default function formatNotification(n: Notification): ContainerBuilder {
  const c = new ContainerBuilder().setAccentColor(
    notificationCategoryToColor(n.category)
  );

  c.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**${n.subject}**`)
  );

  if (n.timestamp || n.sender) {
    const meta = [];

    if (n.sender) meta.push(n.sender);
    if (n.timestamp) meta.push(`<t:${Math.floor(n.timestamp / 1000)}:R>`);

    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(meta.join(" • "))
    );
  }

  c.addSeparatorComponents(
    new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
  );

  c.addTextDisplayComponents(new TextDisplayBuilder().setContent(n.body));

  return c;
}

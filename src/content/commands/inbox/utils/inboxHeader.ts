import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from "discord.js";
import generatePageActionRow from "./generatePageActionRow.js";

export default function inboxHeader(
  name: string,
  showArchived: boolean,
  showNotifications: boolean
) {
  return (page: ContainerBuilder) => {
    page.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${name.length > 20 ? `${name.slice(0, 20)}...` : name}'s Inbox`
      )
    );

    page.addActionRowComponents(
      generatePageActionRow(showArchived, showNotifications)
    );

    page.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
    );

    return {};
  };
}

import {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
} from "discord.js";
import generatePageActionRow from "./generatePageActionRow.js";

export default function addHeader(name: string, showArchived: boolean) {
  return (page: ContainerBuilder) => {
    page.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${name.length > 20 ? `${name.slice(0, 20)}...` : name}'s Inbox`
      )
    );

    page.addActionRowComponents(generatePageActionRow(showArchived));

    page.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
    );

    return {};
  };
}

import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { ContainerSnippet } from "../../../../utils/containerSnippetPaginator.js";
import lettersOnlyContainArchived from "./lettersOnlyContainArchived.js";
import selectRandomFromArray from "../../../../utils/selectRandomFromArray.js";
import Player from "../../../../models/player/player.js";

export default function generateContainerSnippets({
  inbox: { letters },
  settings: { indexShowArchived: showArchived },
}: Player): ContainerSnippet[] {
  const snippets = [];

  if (lettersOnlyContainArchived(letters) && showArchived === false) {
    snippets.push((page: ContainerBuilder) =>
      page.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          selectRandomFromArray([
            "You're in the clear!",
            "No letters in sight.",
            "Your inbox is empty.",
            "You have no letters.",
            "Nothin' to see here!",
          ])
        )
      )
    );
    return snippets;
  }

  for (const letter of letters) {
    if (letter.isArchived === true && showArchived === false) continue;

    snippets.push((page: ContainerBuilder) => {
      page.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `### ${letter.sender}:${
                letter.isArchived === true ? " (Archived)" : ""
              }\n${letter.subject}`
            )
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("#open-" + letter.id)
              .setLabel("Open")
              .setStyle(ButtonStyle.Secondary)
          )
      );
    });
  }

  return snippets;
}

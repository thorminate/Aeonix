import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { ContainerSnippet } from "../../../../utils/containerSnippetPaginator.js";
import selectRandomFromArray from "../../../../utils/selectRandomFromArray.js";
import Player from "../../../../models/player/player.js";
import lettersOnlyContainsFilterables from "./lettersOnlyContainsFilterables.js";
import lettersOnlyContainsArchived from "./lettersOnlyContainsArchived.js";
import lettersOnlyContainsNotifications from "./lettersOnlyContainsNotifications.js";

export default function generateInboxContents({
  inbox: { letters },
  settings: {
    inboxShowArchived: showArchived,
    inboxShowNotifications: showNotifications,
  },
}: Player): ContainerSnippet[] {
  const snippets: ContainerSnippet[] = [];

  if (
    (lettersOnlyContainsFilterables(letters) &&
      showArchived === false &&
      showNotifications === false) ||
    (lettersOnlyContainsArchived(letters) && showArchived === false) ||
    (lettersOnlyContainsNotifications(letters) &&
      showNotifications === false) ||
    letters.length === 0
  ) {
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
    if (letter.isNotification === true && showNotifications === false) continue;

    const assembledLetterTag = (() => {
      if (letter.isNotification === true && letter.isArchived === true)
        return "  (Archived Notification)";
      else if (letter.isNotification === true) return "  (Notification)";
      else if (letter.isArchived === true) return "  (Archived)";
      else return "";
    })();

    snippets.push((page: ContainerBuilder) => {
      page.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `### ${letter.sender}:${assembledLetterTag}\n-# ${letter.subject}`
            )
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("#open-" + letter.id)
              .setLabel("Open")
              .setStyle(ButtonStyle.Secondary)
          )
      );

      return { letter };
    });
  }

  return snippets;
}

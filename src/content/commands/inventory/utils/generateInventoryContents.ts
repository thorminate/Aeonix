import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
} from "discord.js";
import Player from "../../../../models/player/player.js";
import { ContainerSnippet } from "../../../../utils/containerSnippetPaginator.js";
import selectRandomFromArray from "../../../../utils/selectRandomFromArray.js";

export default function generateInventoryContents({
  inventory: { entries },
}: Player): ContainerSnippet[] {
  const snippets: ContainerSnippet[] = [];
  if (entries.length === 0) {
    snippets.push((page: ContainerBuilder) =>
      page.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          selectRandomFromArray([
            "Seemingly empty.",
            "You have no items, nada!",
            "Your inventory is empty.",
            "You have no items.",
            "Nothin' to see here!",
          ])
        )
      )
    );
    return snippets;
  }

  for (const entry of entries) {
    snippets.push((page: ContainerBuilder) => {
      page.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `### ${entry.name}:\n-# ${entry.description}`
            )
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("#open-" + entry.id)
              .setLabel("Open")
              .setStyle(ButtonStyle.Secondary)
          )
      );

      return { entry };
    });
  }

  return snippets;
}

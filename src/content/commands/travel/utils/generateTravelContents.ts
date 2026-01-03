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
import aeonix from "../../../../index.js";

export default async function generateTravelContents({
  location: { adjacents },
}: Player): Promise<ContainerSnippet[]> {
  const snippets: ContainerSnippet[] = [];
  if (adjacents.length === 0) {
    snippets.push((page: ContainerBuilder) =>
      page.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          selectRandomFromArray([
            "You have nowhere to go.",
            "Hmm, it looks like you can't go anywhere.",
            "It seems like you're stuck here.",
          ])
        )
      )
    );
    return snippets;
  }

  for (const adjacentStr of adjacents) {
    const adjacent = await aeonix.environments.get(adjacentStr);
    if (!adjacent) continue;
    snippets.push((page: ContainerBuilder) => {
      page.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `### ${adjacent.name}:\n-# ${adjacent.description}`
            )
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("#travel-" + adjacent._id)
              .setLabel("Travel")
              .setStyle(ButtonStyle.Primary)
          )
      );

      return { adjacent };
    });
  }

  return snippets;
}

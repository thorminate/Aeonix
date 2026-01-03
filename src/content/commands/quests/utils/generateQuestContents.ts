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

export default function generateQuestContents({
  quests: { arr: quests },
}: Player): ContainerSnippet[] {
  const snippets: ContainerSnippet[] = [];

  if (quests.length === 0) {
    snippets.push((page: ContainerBuilder) =>
      page.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          selectRandomFromArray([
            "You have no active quests.",
            "Your quest log is empty.",
            "No adventures await you at the moment.",
          ])
        )
      )
    );
    return snippets;
  }

  for (const quest of quests) {
    snippets.push((page: ContainerBuilder) => {
      page.addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `### ${quest.name}\n${
                quest.completed ? "✅ Completed" : "In Progress"
              }`
            )
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("#open-" + quest.id)
              .setLabel("View")
              .setStyle(ButtonStyle.Secondary)
          )
      );

      return { quest };
    });
  }

  return snippets;
}

import {
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
} from "discord.js";
import Quest from "#player/utils/quests/quest.js";

export default function generateQuestContainer(quest: Quest) {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Quest:** ${quest.name}\n**Status:** ${
          quest.completed ? "Completed" : "In Progress"
        }`
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(quest.description)
    )
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("#close")
          .setLabel("Close")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("#abandon-" + quest.id)
          .setLabel("Abandon")
          .setStyle(ButtonStyle.Danger)
      )
    );
}

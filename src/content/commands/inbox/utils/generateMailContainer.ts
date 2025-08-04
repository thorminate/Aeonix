import {
  ContainerBuilder,
  SectionBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
} from "discord.js";
import Letter from "../../../../models/player/utils/inbox/letter.js";

export default function generateMailContainer(letter: Letter) {
  return new ContainerBuilder()
    .addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**${letter.sender}: ** ${letter.subject}`
          )
        )
        .setButtonAccessory(
          letter.canDismiss === true
            ? letter.isArchived === false
              ? new ButtonBuilder()
                  .setCustomId("#archive-" + letter.id)
                  .setLabel("Archive")
                  .setStyle(ButtonStyle.Danger)
              : new ButtonBuilder()
                  .setCustomId("#archive-" + letter.id)
                  .setLabel("Unarchive")
                  .setStyle(ButtonStyle.Secondary)
            : new ButtonBuilder()
                .setDisabled(true)
                .setLabel("Can't archive")
                .setCustomId("#placeholder")
                .setStyle(ButtonStyle.Secondary)
        )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(letter.body))
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        letter.interactable === true
          ? [
              new ButtonBuilder()
                .setCustomId("#close")
                .setLabel("Close")
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId("#use-" + letter.id)
                .setLabel(letter.interactionType ?? "Interact")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(
                  letter.oneTimeInteraction === true
                    ? letter.isInteracted === true
                      ? true
                      : false
                    : false
                ),
            ]
          : [
              new ButtonBuilder()
                .setCustomId("#close")
                .setLabel("Close")
                .setStyle(ButtonStyle.Secondary),
            ]
      )
    );
}

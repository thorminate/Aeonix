import {
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ActionRowBuilder,
} from "discord.js";
import Item from "../../../../models/item/item.js";

export default function generateEntryContainer(entry: Item) {
  return new ContainerBuilder()
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`## ${entry.name}:`)
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(entry.description)
    )
    .addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        entry.interactable === true
          ? [
              new ButtonBuilder()
                .setCustomId("#close")
                .setLabel("Close")
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId("#drop-" + entry.id)
                .setLabel("Drop")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!entry.canDrop),
              new ButtonBuilder()
                .setCustomId("#use-" + entry.id)
                .setLabel(entry.interactionType ?? "Interact")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(
                  entry.oneTimeInteraction === true &&
                    entry.isInteracted === true
                ),
            ]
          : [
              new ButtonBuilder()
                .setCustomId("#close")
                .setLabel("Close")
                .setStyle(ButtonStyle.Secondary),
              new ButtonBuilder()
                .setCustomId("#drop-" + entry.id)
                .setLabel("Drop")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!entry.canDrop),
            ]
      )
    );
}

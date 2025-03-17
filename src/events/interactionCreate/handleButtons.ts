import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Player from "../../models/player/Player.js";
import buttonWrapper from "../../utils/buttonWrapper.js";
import { Event } from "../../handlers/eventHandler.js";
import Item from "../../models/item/item.js";

export default async (event: Event) => {
  const { arg } = event;
  const buttonInteraction = arg as ButtonInteraction;

  if (!buttonInteraction.isButton()) return;

  switch (buttonInteraction.customId) {
    // #region onboarding

    case "onboarding-1":
      if (await Player.load(buttonInteraction.user.username)) {
        await buttonInteraction.reply({
          content:
            "You have already initialized your persona. Do you wish to delete it?",
          components: buttonWrapper([
            new ButtonBuilder()
              .setCustomId("delete-player")
              .setLabel("Delete?")
              .setStyle(ButtonStyle.Danger),
          ]),
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await buttonInteraction.showModal(
        new ModalBuilder()
          .setTitle("Step 1/1 - Display Name")
          .setCustomId("onboarding-display-name")
          .addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("display-name")
                .setLabel("Display name/Character Name")
                .setPlaceholder("Name of your character within this world.")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(32)
                .setMinLength(2)
            )
          )
      );
      break;

    case "delete-player":
      if (!(await Player.load(buttonInteraction.user.username))) {
        await buttonInteraction.reply({
          content:
            "You don't exist in the DB, therefore you cannot be deleted.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const buttons = buttonWrapper([
        new ButtonBuilder()
          .setCustomId("delete-player-confirmed")
          .setLabel("Yes")
          .setStyle(ButtonStyle.Danger),
      ]);

      await buttonInteraction.reply({
        content: "Are you sure you want to delete your persona?",
        components: buttons,
        flags: MessageFlags.Ephemeral,
      });

      break;

    case "delete-player-confirmed":
      if (!(await Player.load(buttonInteraction.user.username))) {
        await buttonInteraction.reply({
          content:
            "You don't exist in the DB, therefore you cannot be deleted.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      await Player.delete(buttonInteraction.user.username);

      await buttonInteraction.reply({
        content: "Your persona has been deleted.",
        flags: MessageFlags.Ephemeral,
      });

      break;

    // #endregion

    case "test":
      const player = await Player.load(buttonInteraction.user.username);

      if (!player) {
        await buttonInteraction.reply({
          content:
            "You don't exist in the DB, therefore you cannot be deleted.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const inventoryEntry = (
        await Item.find("BackpackItem")
      ).toInventoryEntry();

      player.inventory.add(inventoryEntry);

      player.save();
      await buttonInteraction.reply({
        content:
          "inventory updated" +
          JSON.stringify(player.inventory) +
          "\n\n" +
          JSON.stringify(inventoryEntry),
        flags: MessageFlags.Ephemeral,
      });
      break;
  }
};

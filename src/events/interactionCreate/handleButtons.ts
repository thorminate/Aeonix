import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Player from "../../models/player/Player";
import buttonWrapper from "../../utils/buttonWrapper";
import { Event } from "../../handlers/eventHandler";

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
          ephemeral: true,
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
          ephemeral: true,
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
        ephemeral: true,
      });

      break;

    case "delete-player-confirmed":
      if (!(await Player.load(buttonInteraction.user.username))) {
        await buttonInteraction.reply({
          content:
            "You don't exist in the DB, therefore you cannot be deleted.",
          ephemeral: true,
        });
        return;
      }

      await Player.delete(buttonInteraction.user.username);

      await buttonInteraction.reply({
        content: "Your persona has been deleted.",
        ephemeral: true,
      });

      break;

    // #endregion
  }
};

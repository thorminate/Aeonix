import { ButtonBuilder, ButtonStyle, ModalSubmitInteraction } from "discord.js";
import Player from "../../models/player/Player";
import { Event } from "../../handlers/eventHandler";
import buttonWrapper from "../../utils/buttonWrapper";
import log from "../../utils/log";

export default async (event: Event) => {
  const modalInteraction = event.arg as ModalSubmitInteraction;

  if (!modalInteraction.isModalSubmit()) return;

  switch (modalInteraction.customId) {
    case "set-display-name":
      const displayName =
        modalInteraction.fields.getTextInputValue("display-name");

      log({
        header: `Setting display name to ${displayName}`,
        type: "Info",
      });

      const playerExists = await Player.load(modalInteraction.user.username);

      log({
        header: "Checking if player exists",
        payload: playerExists,
        type: "Info",
      });

      if (playerExists) {
        log({
          header: "Player already exists",
          type: "Info",
        });
        const buttons = buttonWrapper([
          new ButtonBuilder()
            .setCustomId("delete-player")
            .setLabel("Delete?")
            .setStyle(ButtonStyle.Danger),
        ]);

        await modalInteraction.reply({
          content:
            "You have already initialized your persona. Do you wish to delete it?",
          components: buttons,
          ephemeral: true,
        });
        return;
      }

      const player = new Player(modalInteraction.user, displayName);

      log({
        header: "Saving player",
        type: "Info",
      });

      await player.save();

      log({
        header: "Saved player",
        type: "Info",
      });

      await modalInteraction.reply({
        content: "Display name set",
        ephemeral: true,
      });

      break;
  }
};

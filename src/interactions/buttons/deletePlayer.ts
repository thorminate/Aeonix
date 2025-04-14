import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import Button from "../../utils/button.js";
import Player from "../../models/Game/Player/Player.js";
import buttonWrapper from "../../utils/buttonWrapper.js";
import log from "../../utils/log.js";

export default new Button({
  customId: "deletePlayer",

  callback: async (buttonContext: ButtonInteraction) => {
    if (!(await Player.find(buttonContext.user.username))) {
      await buttonContext.reply({
        content: "You don't exist in the DB, therefore you cannot be deleted.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const buttons = buttonWrapper([
      new ButtonBuilder()
        .setCustomId("deletePlayerConfirmed")
        .setLabel("Yes")
        .setStyle(ButtonStyle.Danger),
    ]);

    await buttonContext.reply({
      content: "Are you sure you want to delete your persona?",
      components: buttons,
      flags: MessageFlags.Ephemeral,
    });
  },

  onError(error) {
    log({
      header: "Button Error",
      processName: "DeletePlayerButton",
      payload: error,
      type: "Error",
    });
  },
});

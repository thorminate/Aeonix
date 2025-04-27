import { ButtonBuilder, ButtonStyle } from "discord.js";
import Button from "../button.js";
import Player from "../../models/player/player.js";
import buttonWrapper from "../../utils/buttonWrapper.js";
import log from "../../utils/log.js";

export default new Button({
  customId: "deletePlayer",
  ephemeral: true,
  acknowledge: false,
  passPlayer: false,

  callback: async (buttonContext) => {
    if (!(await Player.find(buttonContext.user.username))) {
      await buttonContext.update({
        content: "You don't exist in the DB, therefore you cannot be deleted.",
      });
      return;
    }

    const buttons = buttonWrapper(
      new ButtonBuilder()
        .setCustomId("deletePlayerConfirmed")
        .setLabel("Yes")
        .setStyle(ButtonStyle.Danger)
    );

    await buttonContext.update({
      content: "Are you sure you want to delete your persona?",
      components: buttons,
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

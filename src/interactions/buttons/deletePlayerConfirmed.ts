import { MessageFlags } from "discord.js";
import Player from "../../models/Game/Player/Player.js";
import Button from "../../utils/button.js";
import log from "../../utils/log.js";

export default new Button({
  customId: "deletePlayerConfirmed",

  callback: async (buttonContext) => {
    if (!(await Player.find(buttonContext.user.username))) {
      await buttonContext.reply({
        content: "You don't exist in the DB, therefore you cannot be deleted.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await Player.delete(buttonContext.user.username);

    await buttonContext.reply({
      content: "Your persona has been deleted.",
      flags: MessageFlags.Ephemeral,
    });
  },

  onError(error) {
    log({
      header: "Button Error",
      processName: "DeletePlayerConfirmedButton",
      payload: error,
      type: "Error",
    });
  },
});

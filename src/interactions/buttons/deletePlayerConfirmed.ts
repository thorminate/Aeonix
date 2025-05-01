import Player from "../../models/player/player.js";
import Button from "../button.js";
import log from "../../utils/log.js";
import { ButtonBuilder, ButtonStyle } from "discord.js";

export default new Button({
  data: new ButtonBuilder()
    .setCustomId("deletePlayerConfirmed")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),
  customId: "deletePlayerConfirmed",
  ephemeral: true,
  acknowledge: false,
  passPlayer: false,

  callback: async (context) => {
    if (!(await Player.find(context.user.username))) {
      await context.update({
        content: "You don't exist in the DB, therefore you cannot be deleted.",
      });
      return;
    }

    await Player.delete(context.user.username);

    await context.update({
      content: "Your persona has been deleted.",
      components: [],
    });
  },

  onError(e) {
    log({
      header: "Button Error",
      processName: "DeletePlayerConfirmedButton",
      payload: e,
      type: "Error",
    });
  },
});

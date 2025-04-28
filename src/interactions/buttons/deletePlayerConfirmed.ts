import Player from "../../models/player/player.js";
import Button from "../button.js";
import log from "../../utils/log.js";

export default new Button({
  customId: "deletePlayerConfirmed",
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

    await Player.delete(buttonContext.user.username);

    await buttonContext.update({
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

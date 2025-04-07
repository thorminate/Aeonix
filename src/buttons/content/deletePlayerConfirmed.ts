import { MessageFlags } from "discord.js";
import Player from "../../models/Game/Player/Player.js";
import Button from "../button.js";

export default <Button>{
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
};

import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import { Button } from "../../button.js";
import Player from "../../../models/player/Player.js";
import buttonWrapper from "../../buttonWrapper.js";

export default <Button>{
  customId: "delete-player",
  callback: async (buttonContext: ButtonInteraction) => {
    if (!(await Player.load(buttonContext.user.username))) {
      await buttonContext.reply({
        content: "You don't exist in the DB, therefore you cannot be deleted.",
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

    await buttonContext.reply({
      content: "Are you sure you want to delete your persona?",
      components: buttons,
      flags: MessageFlags.Ephemeral,
    });
  },
};

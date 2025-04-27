import {
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Player from "../../models/player/player.js";
import Command from "../command.js";
import {
  welcomeImage,
  welcomeMessage,
} from "../../events/ready/02registerOnboarding.js";
import log from "../../utils/log.js";
import buttonWrapper from "../../utils/buttonWrapper.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("init")
    .setDescription("Initializes your persona"),
  passPlayer: false,
  acknowledge: true,

  callback: async (commandContext) => {
    if (await Player.find(commandContext.user.username)) {
      const buttons = buttonWrapper(
        new ButtonBuilder()
          .setCustomId("deletePlayer")
          .setLabel("Delete?")
          .setStyle(ButtonStyle.Danger)
      );

      await commandContext.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const components = buttonWrapper(
      new ButtonBuilder()
        .setCustomId("onboarding1")
        .setLabel("Begin")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👋")
    );

    await commandContext.editReply({
      files: [welcomeImage],
    });

    await commandContext.followUp({
      content: welcomeMessage,
      components,
      flags: MessageFlags.Ephemeral,
    });
  },

  onError(error: Error) {
    log({
      header: "Error with init command",
      processName: "InitCommand",
      payload: error,
      type: "Error",
    });
  },
});

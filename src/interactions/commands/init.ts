import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Player from "../../models/Game/Player/Player.js";
import Command, { CmdInteraction } from "../command.js";
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

  callback: async (context: CmdInteraction) => {
    if (await Player.find(context.user.username)) {
      const buttons = buttonWrapper(
        new ButtonBuilder()
          .setCustomId("deletePlayer")
          .setLabel("Delete?")
          .setStyle(ButtonStyle.Danger)
      );

      await context.editReply({
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

    await context.editReply({
      files: [welcomeImage],
    });

    await context.followUp({
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

import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Player from "../../models/player/Player.js";
import buttonWrapper from "../../buttons/buttonWrapper.js";
import Command from "../command.js";
import {
  welcomeImage,
  welcomeMessage,
} from "../../events/ready/02register-onboarding.js";
import log from "../../utils/log.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("init")
    .setDescription("Initializes your persona"),

  callback: async (context: CommandInteraction) => {
    if (await Player.load(context.user.username)) {
      const buttons = buttonWrapper([
        new ButtonBuilder()
          .setCustomId("delete-player")
          .setLabel("Delete?")
          .setStyle(ButtonStyle.Danger),
      ]);

      await context.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const components = buttonWrapper([
      new ButtonBuilder()
        .setCustomId("onboarding-1")
        .setLabel("Begin")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👋"),
    ]);

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
      payload: `${error}`,
      type: "Error",
    });
  },
});

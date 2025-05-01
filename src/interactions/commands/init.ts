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
import deletePlayer from "../buttons/deletePlayer.js";
import componentWrapper from "../../utils/componentWrapper.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("init")
    .setDescription("Initializes your persona"),
  passPlayer: false,
  acknowledge: true,

  callback: async (context) => {
    if (await Player.find(context.user.username)) {
      const buttons = componentWrapper(deletePlayer.data);

      await context.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const components = componentWrapper(
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

  onError(e) {
    log({
      header: "Error with init command",
      processName: "InitCommand",
      payload: e,
      type: "Error",
    });
  },
});

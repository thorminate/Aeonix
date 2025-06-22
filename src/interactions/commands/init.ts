import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Player from "../../models/player/player.js";
import {
  welcomeImage,
  welcomeMessage,
} from "../../events/ready/02registerOnboarding.js";
import log from "../../utils/log.js";
import deletePlayer from "../buttons/deletePlayer.js";
import componentWrapper from "../../utils/componentWrapper.js";
import Interaction from "../interaction.js";
import onboarding0 from "../buttons/onboarding0.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("init")
    .setDescription("Initializes your persona"),

  interactionType: "command",
  passPlayer: false,
  ephemeral: true,
  acknowledge: true,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    if (await Player.find(context.user.id)) {
      const buttons = componentWrapper(deletePlayer.data);

      await context.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const components = componentWrapper(onboarding0.data);

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

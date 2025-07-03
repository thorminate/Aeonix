import { ButtonBuilder, ButtonStyle, MessageFlags } from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import deletePlayer from "./deletePlayer.js";
import onboarding1 from "../modals/onboarding1.js";
import componentWrapper from "../../utils/componentWrapper.js";
import Interaction from "../../models/core/interaction.js";

export default new Interaction({
  data: new ButtonBuilder()
    .setCustomId("onboarding0")
    .setLabel("Begin")
    .setEmoji("👋")
    .setStyle(ButtonStyle.Primary),

  interactionType: "button",
  ephemeral: true,
  acknowledge: false,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    if (await Player.find(context.user.id)) {
      await context.reply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: componentWrapper(deletePlayer.data),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await context.showModal(onboarding1.data);
  },

  onError(e) {
    log({
      header: "Button Error",
      processName: "Onboarding0Button",
      payload: e,
      type: "Error",
    });
  },
});

import { ButtonBuilder, MessageFlags } from "discord.js";
import Button from "../button.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import deletePlayer from "./deletePlayer.js";
import onboardingDisplayName from "../modals/onboardingDisplayName.js";
import componentWrapper from "../../utils/componentWrapper.js";

export default new Button({
  data: new ButtonBuilder(),
  customId: "onboarding1",
  ephemeral: true,
  acknowledge: false,
  passPlayer: false,

  callback: async (context) => {
    if (await Player.find(context.user.id)) {
      await context.reply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: componentWrapper(deletePlayer.data),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await context.showModal(onboardingDisplayName.data);
  },

  onError(e) {
    log({
      header: "Button Error",
      processName: "Onboarding1Button",
      payload: e,
      type: "Error",
    });
  },
});

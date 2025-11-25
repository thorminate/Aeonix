import { ButtonStyle, MessageFlags } from "discord.js";
import deletePlayer from "./../deletePlayer/deletePlayer.js";
import onboarding1 from "../../modals/onboarding1/onboarding1.js";
import componentWrapper from "../../../utils/componentWrapper.js";
import Interaction, {
  ButtonBuilderV2,
  InteractionTypes,
} from "../../../models/events/interaction.js";
import aeonix from "../../../index.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("onboarding0")
    .setLabel("Begin")
    .setEmoji("👋")
    .setStyle(ButtonStyle.Primary),

  interactionType: InteractionTypes.Button,
  ephemeral: true,
  acknowledge: false,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context, aeonix }) => {
    if (await aeonix.players.exists(context.user.id)) {
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
    aeonix.logger.error("Onboarding0", "Button Error", e);
  },
});

import { ButtonStyle } from "discord.js";
import Interaction, {
  ButtonBuilderV2,
  InteractionTypes,
} from "../../../models/events/interaction.js";
import aeonix from "../../../index.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("deletePlayerConfirmed")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),

  interactionType: InteractionTypes.Button,
  ephemeral: true,
  acknowledge: false,
  passPlayer: true,

  callback: async ({ context, player }) => {
    await player.use(async (p) => {
      await p.delete();
    });

    await context.update({
      content: "Your persona has been deleted.",
      components: [],
    });
  },

  onError(e) {
    aeonix.logger.error("DeletePlayerConfirmed", "Button Error", e);
  },
});

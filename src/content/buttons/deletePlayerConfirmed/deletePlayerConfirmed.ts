import log from "../../utils/log.js";
import { ButtonStyle } from "discord.js";
import Interaction, {
  ButtonBuilderV2,
  ITypes,
} from "../../models/core/interaction.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("deletePlayerConfirmed")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),

  interactionType: ITypes.Button,
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
    log({
      header: "Button Error",
      processName: "DeletePlayerConfirmedButton",
      payload: e,
      type: "Error",
    });
  },
});

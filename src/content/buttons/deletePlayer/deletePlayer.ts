import { ButtonStyle } from "discord.js";
import deletePlayerConfirmed from "./../deletePlayerConfirmed/deletePlayerConfirmed.js";
import componentWrapper from "../../../utils/componentWrapper.js";
import Interaction, {
  ButtonBuilderV2,
  InteractionTypes,
} from "../../../models/events/interaction.js";
import aeonix from "../../../index.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("deletePlayer")
    .setLabel("Delete")
    .setStyle(ButtonStyle.Danger),

  interactionType: InteractionTypes.Button,
  acknowledge: false,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context, aeonix }) => {
    if (!aeonix.players.exists(context.user.id)) {
      await context.update({
        content:
          "You don't exist in the database, therefore you cannot be deleted.",
      });
      return;
    }

    await context.update({
      content: "Are you sure you want to delete your persona?",
      components: componentWrapper(deletePlayerConfirmed.data),
    });
  },

  onError(e) {
    aeonix.logger.error("DeletePlayer", "Button Error", e);
  },
});

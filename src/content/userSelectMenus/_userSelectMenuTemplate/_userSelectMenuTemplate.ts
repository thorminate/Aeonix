import { UserSelectMenuBuilder } from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";

export default new Interaction({
  data: new UserSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: InteractionTypes.UserSelectMenu,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template userSelectMenu executed!",
    });
  },

  onError: (e, aeonix) => {
    aeonix.logger.error("UserSelectMenuTemplate", "Command Error", e);
  },
});

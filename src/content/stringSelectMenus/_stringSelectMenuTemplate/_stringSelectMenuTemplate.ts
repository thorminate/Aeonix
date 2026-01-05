import { StringSelectMenuBuilder } from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";

export default new Interaction({
  data: new StringSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: InteractionTypes.StringSelectMenu,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template stringSelectMenu executed!",
    });
  },

  onError: (e, aeonix) => {
    aeonix.logger.error("StringSelectMenuTemplate", "Command Error", e);
  },
});

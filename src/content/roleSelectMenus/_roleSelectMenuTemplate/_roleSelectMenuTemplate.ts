import { RoleSelectMenuBuilder } from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";

export default new Interaction({
  data: new RoleSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: InteractionTypes.RoleSelectMenu,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template roleSelectMenu executed!",
    });
  },

  onError: (e, aeonix) => {
    aeonix.logger.error("RoleSelectMenuTemplate", "Command Error", e);
  },
});

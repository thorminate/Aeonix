import { MentionableSelectMenuBuilder } from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";

export default new Interaction({
  data: new MentionableSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: InteractionTypes.MentionableSelectMenu,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template mentionableSelectMenu executed!",
    });
  },

  onError: (e, aeonix) => {
    aeonix.logger.error("MentionableSelectMenuTemplate", "Command Error", e);
  },
});

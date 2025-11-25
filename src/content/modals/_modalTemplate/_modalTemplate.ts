import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";

export default new Interaction({
  data: new ModalBuilder()
    .setCustomId("template")
    .setTitle("Template Modal")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("template")
          .setLabel("Template")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    ),

  interactionType: InteractionTypes.Modal,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template modal executed!",
    });
  },

  onError: (e, aeonix) => {
    aeonix.logger.error("ModalTemplate", "Modal Error", e);
  },
});

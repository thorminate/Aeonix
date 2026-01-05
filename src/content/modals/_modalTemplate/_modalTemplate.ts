import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";

export default new Interaction({
  data: new ModalBuilder()
    .setCustomId("template")
    .setTitle("Template Modal")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Template")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("template")
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

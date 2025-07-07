import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Interaction, { ITypes } from "../../models/core/interaction.js";
import log from "../../utils/log.js";

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

  interactionType: ITypes.Modal,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template modal executed!",
    });
  },

  onError: (e) => {
    log({
      header: "Modal Error",
      processName: "TemplateModal",
      payload: e,
      type: "Error",
    });
  },
});

import { StringSelectMenuBuilder } from "discord.js";
import Interaction, { ITypes } from "../../../models/core/interaction.js";
import log from "../../../utils/log.js";

export default new Interaction({
  data: new StringSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: ITypes.StringSelectMenu,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template stringSelectMenu executed!",
    });
  },

  onError: (e) => {
    log({
      header: "StringSelectMenu Error",
      processName: "TemplateStringSelectMenu",
      payload: e,
      type: "Error",
    });
  },
});

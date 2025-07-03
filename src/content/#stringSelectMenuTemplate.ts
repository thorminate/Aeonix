import { StringSelectMenuBuilder } from "discord.js";
import Interaction from "../models/core/interaction.js";
import log from "../utils/log.js";

export default new Interaction({
  data: new StringSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: "stringSelectMenu",
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

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

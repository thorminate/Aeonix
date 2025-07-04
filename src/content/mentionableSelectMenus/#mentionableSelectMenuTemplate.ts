import { MentionableSelectMenuBuilder } from "discord.js";
import Interaction from "../models/core/interaction.js";
import log from "../utils/log.js";

export default new Interaction({
  data: new MentionableSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: "mentionableSelectMenu",
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template mentionableSelectMenu executed!",
    });
  },

  onError: (e) => {
    log({
      header: "MentionableSelectMenu Error",
      processName: "TemplateMentionableSelectMenu",
      payload: e,
      type: "Error",
    });
  },
});

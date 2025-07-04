import { ButtonBuilder, ButtonStyle } from "discord.js";
import Interaction from "../models/core/interaction.js";
import log from "../utils/log.js";

export default new Interaction({
  data: new ButtonBuilder()
    .setCustomId("template")
    .setLabel("Template")
    .setStyle(ButtonStyle.Primary),

  interactionType: "button",
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template button executed!",
    });
  },

  onError: (e) => {
    log({
      header: "Button Error",
      processName: "TemplateButton",
      payload: e,
      type: "Error",
    });
  },
});

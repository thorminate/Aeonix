import { SlashCommandBuilder } from "discord.js";
import Interaction from "../../models/core/interaction.js";
import log from "../../utils/log.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Template"),

  interactionType: "command",
  passPlayer: false,
  acknowledge: true,
  ephemeral: true,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    await context.editReply("Template command executed!");
  },

  onError: (e) => {
    log({
      header: "Command Error",
      processName: "TemplateCommand",
      payload: e,
      type: "Error",
    });
  },
});

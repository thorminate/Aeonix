import { SlashCommandBuilder } from "discord.js";
import Interaction, { ITypes } from "../../models/core/interaction.js";
import log from "../../utils/log.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Template"),

  interactionType: ITypes.Command,
  ephemeral: true,

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

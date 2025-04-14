import { SlashCommandBuilder } from "discord.js";
import Command from "../../utils/command.js";
import log from "../../utils/log.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test command"),

  callback: async (context) => {
    await context.editReply("Test command");
  },

  onError(error) {
    log({
      header: "Error with test command",
      processName: "TestCommand",
      payload: error,
      type: "Error",
    });
  },
});

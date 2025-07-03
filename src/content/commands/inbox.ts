import { SlashCommandBuilder } from "discord.js";
import Interaction from "../../models/core/interaction.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("inbox")
    .setDescription("Shows your inbox"),

  interactionType: "command",
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,
  environmentOnly: true,
  passEnvironment: false,

  callback: async ({ context, player }) => {
    await context.editReply(JSON.stringify(player.inbox));
  },

  onError: (e) => console.error(e),
});

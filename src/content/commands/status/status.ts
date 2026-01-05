// shows your status
import { MessageFlags, SlashCommandBuilder } from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Shows your personal menu"),

  interactionType: InteractionTypes.Command,
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,
  environmentOnly: true,
  passEnvironment: false,

  callback: async ({ context, player }) => {
    await player.use(async (p) => {
      await context.editReply({
        components: [await p.getStatsEmbed()],
        flags: MessageFlags.IsComponentsV2,
      });
    });
  },

  onError(e, aeonix) {
    aeonix.logger.info("StatusCommand", "Command Error", e);
  },
});

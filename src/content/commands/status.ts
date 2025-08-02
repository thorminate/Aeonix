// shows your status
import { HTTPError, MessageFlags, SlashCommandBuilder } from "discord.js";
import log from "../../utils/log.js";
import Interaction, { ITypes } from "../../models/core/interaction.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Shows your personal menu"),

  interactionType: ITypes.Command,
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

  onError(e) {
    if (e instanceof HTTPError && e.status === 503) {
      log({
        header: "Stats Error, the API did not respond in time.",
        processName: "StatsCommand",
        payload: e,
        type: "Error",
      });
      return;
    }
    log({
      header: "Stats Error",
      processName: "StatsCommand",
      payload: e,
      type: "Error",
    });
  },
});

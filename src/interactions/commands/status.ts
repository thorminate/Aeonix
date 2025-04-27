// shows your status
import { HTTPError, SlashCommandBuilder } from "discord.js";
import log from "../../utils/log.js";
import Command from "../command.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows your personal menu"),
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,

  callback: async (context, player) => {
    if (!player) {
      log({
        header: "Player could not be passed to status command",
        processName: "StatusCommand",
        type: "Error",
      });
      return;
    }
    await context.editReply({
      embeds: [await player.getStatusEmbed()],
    });
  },

  onError(error: Error): void {
    if (error instanceof HTTPError && error.status === 503) {
      log({
        header: "Status Error, the API did not respond in time.",
        processName: "StatusCommand",
        payload: error,
        type: "Error",
      });
      return;
    }
    log({
      header: "Status Error",
      processName: "StatusCommand",
      payload: error,
      type: "Error",
    });
  },
});

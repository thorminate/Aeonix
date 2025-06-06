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
  environmentOnly: true,
  passEnvironment: false,

  callback: async (context, player) => {
    await context.editReply({
      embeds: [await player.getStatusEmbed()],
    });
  },

  onError(e) {
    if (e instanceof HTTPError && e.status === 503) {
      log({
        header: "Status Error, the API did not respond in time.",
        processName: "StatusCommand",
        payload: e,
        type: "Error",
      });
      return;
    }
    log({
      header: "Status Error",
      processName: "StatusCommand",
      payload: e,
      type: "Error",
    });
  },
});

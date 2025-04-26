// shows your status
import { HTTPError, SlashCommandBuilder } from "discord.js";
import Player from "../../models/game/player/player.js";
import log from "../../utils/log.js";
import Command, { CmdInteraction } from "../command.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows your personal menu"),
  passPlayer: true,

  callback: async (context: CmdInteraction, player: Player | undefined) => {
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

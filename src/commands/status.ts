// shows your status
import { CommandInteraction, HTTPError, SlashCommandBuilder } from "discord.js";
import Player from "../models/Game/Player/Player.js";
import log from "../utils/log.js";
import Command from "../utils/command.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows your personal menu"),
  passPlayer: true,

  callback: async (context: CommandInteraction, player: Player) => {
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

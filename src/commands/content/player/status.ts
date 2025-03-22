// shows your status
import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  HTTPError,
  SlashCommandBuilder,
} from "discord.js";
import Player from "../../../models/player/Player.js";
import log from "../../../utils/log.js";
import { config } from "dotenv";
import buttonWrapper from "../../../buttons/buttonWrapper.js";
import Command from "../../command.js";
config({
  path: "../../../.env",
});

export default new Command({
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows your personal menu"),

  passPlayer: true,

  callback: async (context: CommandInteraction, player: Player) => {
    await context.editReply({
      embeds: [await player.getStatusEmbed()],
      components: buttonWrapper([
        new ButtonBuilder()
          .setCustomId("test")
          .setLabel("Test")
          .setStyle(ButtonStyle.Primary),
      ]),
    });
  },

  onError(error: Error) {
    if (error instanceof HTTPError && error.status === 503) {
      log({
        header: "Status Error, the API did not respond in time.",
        payload: `${error}`,
        type: "Error",
      });
      return;
    }
    log({
      header: "Status Error",
      payload: `${error}`,
      type: "Error",
    });
  },
});

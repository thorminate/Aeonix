// shows your status
import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  HTTPError,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import Player from "../../models/player/Player";
import log from "../../utils/log";
import { config } from "dotenv";
import commandPrep from "../../utils/commandPrep";
import buttonWrapper from "../../utils/buttonWrapper";
import Command from "../command";
config({
  path: "../../../.env",
});

export default <Command>{
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows your personal menu"),
  //permissionsRequired: [PermissionFlagsBits.Administrator],
  //botPermissions: [PermissionFlagsBits.Administrator],
  //deleted: true,

  callback: async (cmd: CommandInteraction) => {
    try {
      await commandPrep(cmd);

      const player = await Player.load(cmd.user.username);

      if (!player) {
        await cmd.editReply({
          content:
            "You do not exist in the database, please use the /init command.",
        });
        return;
      }

      await cmd.editReply({
        embeds: [await player.getStatusEmbed()],
      });
    } catch (error: unknown) {
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
    }
  },
};

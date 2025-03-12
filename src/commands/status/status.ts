// shows your status
import { Client, CommandInteraction, HTTPError } from "discord.js";
import Player, { PlayerStatus } from "../../models/player/Player";
import log from "../../utils/log";
import { config } from "dotenv";
import commandPrep from "../../utils/commandPrep";
config({
  path: "../../../.env",
});

export default {
  name: "status",
  description: "Shows your personal menu",
  //devOnly: Boolean,
  //testOnly: true,
  //permissionsRequired: [PermissionFlagsBits.Administrator],
  //botPermissions: [PermissionFlagsBits.Administrator],
  //options: [],
  //deleted: true,

  callback: async (cmdAct: CommandInteraction) => {
    try {
      await commandPrep(cmdAct);

      const player = await Player.load(cmdAct.user.username);

      if (!player) {
        await cmdAct.editReply({
          content:
            "Your player does not exist in the database, please head to onboarding channel. If you do not have access to it, use the /init command.",
        });
        return;
      }

      await cmdAct.editReply({
        content: `Your level is ${player.status.level}`,
      });
    } catch (error) {
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

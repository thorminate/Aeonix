// shows your status
import { HTTPError, MessageFlags, SlashCommandBuilder } from "discord.js";
import log from "../../utils/log.js";
import Interaction from "../interaction.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Shows your personal menu"),

  interactionType: "command",
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,
  environmentOnly: true,
  passEnvironment: false,

  callback: async ({ context, player }) => {
    await context.editReply({
      components: [await player.getStatusEmbed()],
      flags: MessageFlags.IsComponentsV2,
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

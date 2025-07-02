import log from "../../utils/log.js";
import { ButtonBuilder, ButtonStyle, GuildMemberRoleManager } from "discord.js";
import aeonix from "../../index.js";
import Interaction from "../interaction.js";

export default new Interaction({
  data: new ButtonBuilder()
    .setCustomId("deletePlayerConfirmed")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),

  interactionType: "button",
  ephemeral: true,
  acknowledge: false,
  passPlayer: true,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context, player }) => {
    const channel = await player.fetchEnvironmentChannel();

    if (!channel) {
      log({
        header: "Environment channel not found",
        processName: "DeletePlayerConfirmedButton",
        type: "Error",
      });
      return;
    }

    await channel.permissionOverwrites.delete(context.user.id);

    await (context.member?.roles as GuildMemberRoleManager).remove(
      aeonix.playerRoleId,
      "Player deleted"
    );

    await player.delete();

    await context.update({
      content: "Your persona has been deleted.",
      components: [],
    });
  },

  onError(e) {
    log({
      header: "Button Error",
      processName: "DeletePlayerConfirmedButton",
      payload: e,
      type: "Error",
    });
  },
});

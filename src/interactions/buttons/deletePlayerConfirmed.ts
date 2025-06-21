import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import { ButtonBuilder, ButtonStyle, GuildMemberRoleManager } from "discord.js";
import aeonix from "../../aeonix.js";
import Interaction from "../interaction.js";

export default new Interaction({
  data: new ButtonBuilder()
    .setCustomId("deletePlayerConfirmed")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),

  interactionType: "button",
  customId: "deletePlayerConfirmed",
  ephemeral: true,
  acknowledge: false,
  passPlayer: true,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context, player }) => {
    await (context.member?.roles as GuildMemberRoleManager).remove(
      aeonix.playerRoleId,
      "Player deleted"
    );

    const channel = await player.fetchEnvironmentChannel(context.guildId || "");

    if (!channel) return;

    await channel.permissionOverwrites.delete(context.user.id);

    await Player.delete(context.user.id);

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

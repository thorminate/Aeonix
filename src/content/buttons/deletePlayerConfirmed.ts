import log from "../../utils/log.js";
import { ButtonStyle, GuildMemberRoleManager } from "discord.js";
import aeonix from "../../index.js";
import Interaction, { ButtonBuilderV2 } from "../../models/core/interaction.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("deletePlayerConfirmed")
    .setLabel("Yes")
    .setStyle(ButtonStyle.Danger),

  interactionType: "button",
  ephemeral: true,
  acknowledge: false,
  passPlayer: true,

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

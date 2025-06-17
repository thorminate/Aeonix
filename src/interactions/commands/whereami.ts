import { SlashCommandBuilder } from "discord.js";
import Command from "../command.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("whereami")
    .setDescription("Tells you your current location"),
  acknowledge: true,
  ephemeral: true,
  passPlayer: true,
  environmentOnly: true,
  passEnvironment: false,

  callback: async (context, player) => {
    const playerEnv = await player.fetchEnvironment();

    if (!playerEnv) {
      await context.editReply("You are not in an environment.");
      return;
    }

    const isAdmin = await player.isAdmin();

    if (isAdmin) {
      await context.editReply(
        `You are currently in \`${playerEnv.name}\` (aka: <#${playerEnv.channelId}>, id: \`${playerEnv.id}\`)`
      );
      return;
    }

    await context.editReply(
      `You are currently in \`${playerEnv.name}\` (aka: <#${playerEnv.channelId}>)`
    );
  },
  onError: (e) => {},
});

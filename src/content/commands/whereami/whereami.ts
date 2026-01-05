import { SlashCommandBuilder } from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("whereami")
    .setDescription("Tells you your current location"),

  interactionType: InteractionTypes.Command,
  acknowledge: true,
  ephemeral: true,
  passPlayer: true,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context, player }) => {
    const playerEnv = await player.use(async (p) => {
      return await p.fetchEnvironment();
    });

    if (!playerEnv) {
      await context.editReply("You are not in an environment.");
      return;
    }

    const isAdmin = await player.use(async (p) => p.isAdmin());

    if (isAdmin) {
      await context.editReply(
        `You are currently in \`${playerEnv.name}\` (aka: <#${playerEnv.channelId}>, id: \`${playerEnv._id}\`)`
      );
      return;
    }

    await context.editReply(
      `You are currently in \`${playerEnv.name}\` (aka: <#${playerEnv.channelId}>)`
    );
  },
  onError: (e, aeonix) => {
    aeonix.logger.error("WhereamiCommand", "Command Error", e);
  },
});

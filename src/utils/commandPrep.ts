import { CommandInteraction, MessageFlags } from "discord.js";

interface Options {
  ephemeral: boolean;
}

export default async (
  interaction: CommandInteraction,
  Options: Options = {
    ephemeral: true,
  }
) => {
  const { ephemeral } = Options;

  if (!interaction.isChatInputCommand() || !interaction.inGuild()) {
    await interaction.reply({
      content: "Invalid command.",
      flags: ephemeral ? MessageFlags.Ephemeral : undefined,
    });
    return;
  }

  await interaction.deferReply({
    ephemeral,
  });
};

import { CommandInteraction } from "discord.js";

interface Options {
  ephemeral: boolean;
}

export default async (interaction: CommandInteraction, Options?: Options) => {
  if (!Options) {
    Options = {
      ephemeral: true,
    };
  }

  await interaction.deferReply({
    ephemeral: Options.ephemeral,
  });
};

import { CommandInteraction } from "discord.js";
import commandVerify from "./commandVerify";

interface Options {
  ephemeral: boolean;
}

export default async (interaction: CommandInteraction, Options?: Options) => {
  if (!Options) {
    Options = {
      ephemeral: true,
    };
  }

  const isCommandValid = await commandVerify(interaction);

  if (!isCommandValid) {
    await interaction.reply({
      content: "Invalid command.",
      ephemeral: Options.ephemeral,
    });
    return;
  }

  await interaction.deferReply({
    ephemeral: Options.ephemeral,
  });
};

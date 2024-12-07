// used to verify if the command is valid.
import { CommandInteraction } from "discord.js"; // Import the discord.js library.

export default async (interaction: CommandInteraction) => {
  // Export the function.
  if (!interaction.isChatInputCommand()) return false;
  if (!interaction.inGuild()) {
    // if the command is not in a guild

    (interaction as CommandInteraction).reply(
      // reply to the command
      "This command can only be used in a server"
    );
    return false;
  }
  return true;
};

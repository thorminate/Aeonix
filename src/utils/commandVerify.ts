// used to verify if the command is valid.
import { CommandInteraction } from "discord.js"; // Import the discord.js library.

export default async (interaction: CommandInteraction) => {
  // Export the function.
  if (!interaction.isChatInputCommand()) return false;
  if (!interaction.inGuild()) return false;
  return true;
};

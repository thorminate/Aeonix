import {
  Client,
  ApplicationCommandManager,
  GuildApplicationCommandManager,
} from "discord.js"; // Get the discord.js library.

export default async function (bot: Client, guildId?: string) {
  // Export the function.
  let applicationCommands:
    | ApplicationCommandManager
    | GuildApplicationCommandManager; // define applicationCommands.

  if (guildId) {
    // if guild is not undefined
    const guild = await bot.guilds.fetch(guildId); // fetch guild
    applicationCommands = guild.commands; // get guild commands
  } else {
    // if guildId is undefined
    applicationCommands = bot.application.commands; // get global commands
  }

  await applicationCommands.fetch({}); // fetch commands
  return applicationCommands; // return commands
}

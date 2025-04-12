import {
  Client,
  ApplicationCommandManager,
  GuildApplicationCommandManager,
} from "discord.js"; // Get the discord.js library.
import { Aeonix } from "../aeonix.js";

export default async function (aeonix: Aeonix, guildId?: string) {
  // Export the function.
  let applicationCommands:
    | ApplicationCommandManager
    | GuildApplicationCommandManager; // define applicationCommands.

  if (guildId) {
    // if guild is not undefined
    const guild = await aeonix.guilds.fetch(guildId); // fetch guild
    applicationCommands = guild.commands; // get guild commands
  } else {
    // if guildId is undefined
    applicationCommands = aeonix.application.commands; // get global commands
  }

  await applicationCommands.fetch({}); // fetch commands
  return applicationCommands; // return commands
}

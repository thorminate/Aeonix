/**
 * Handles the slash commands.
 * @param {Event} event The event object containing the interaction and client (bot)
 */
import getLocalCommands from "../../utils/getLocalCommands.js";
import {
  CommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import log from "../../utils/log.js";
import { Event } from "../../handlers/eventHandler.js";
import Command from "../../commands/command.js";

export default async (event: Event) => {
  const interaction = event.arg as CommandInteraction;

  if (!interaction.isChatInputCommand()) return;
  // get already registered commands
  const localCommands = await getLocalCommands();

  try {
    // check if command name is in localCommands
    const commandObject: Command = localCommands.find(
      (cmd: Command) => cmd.data.name === interaction.commandName
    );

    // if commandObject does not exist, return
    if (!commandObject) return;

    // if command is devOnly and user is not an admin, return
    if (commandObject.adminOnly) {
      if (
        !(interaction.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        interaction.reply({
          content: "Only administrators can run this command",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // if command requires permissions and user does not have aforementioned permission, return
    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (
          !(interaction.member.permissions as PermissionsBitField).has(
            permission
          )
        ) {
          interaction.reply({
            content: "You don't have permissions to run this command.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }
    // if all goes well, run the commands callback function.
    await commandObject.callback(interaction);
  } catch (error) {
    log({
      header: "Command Error",
      payload: `${error}`,
      type: "Error",
    });
  }
};

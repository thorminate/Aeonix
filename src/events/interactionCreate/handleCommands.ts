/**
 * Handles the slash commands.
 * @param {Event} event The event object containing the interaction and client (bot)
 */
import getLocalCommands from "../../commands/getLocalCommands.js";
import {
  CommandInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import log from "../../utils/log.js";
import { Event } from "../../handlers/eventHandler.js";
import Command from "../../commands/command.js";
import commandPrep from "../../commands/commandPrep.js";
import Player from "../../models/player/Player.js";

export default async (event: Event) => {
  const interaction = event.arg as CommandInteraction;

  try {
    if (!interaction.isChatInputCommand()) return;

    // get already registered commands
    const localCommands = await getLocalCommands();

    // check if command name is in localCommands
    const commandObject: Command = localCommands.find(
      (cmd: Command) => cmd.data.name === interaction.commandName
    );

    // if commandObject does not exist, return
    if (!commandObject) return;

    await commandPrep(interaction, {
      ephemeral: commandObject.ephemeral,
    });

    // if command is devOnly and user is not an admin, return
    if (commandObject.adminOnly) {
      if (
        !(interaction.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        interaction.editReply({
          content: "Only administrators can run this command",
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
          interaction.editReply({
            content: "You don't have permissions to run this command.",
          });
          return;
        }
      }
    }

    let player: Player;

    if (commandObject.passPlayer) {
      player = await Player.load(interaction.user.username);

      if (!player) {
        interaction.editReply({
          content:
            "You don't exist in the database, please use the /init command.",
        });
        return;
      }
    }

    // if all goes well, run the commands callback function.
    await commandObject
      .callback(interaction, player)
      .catch((e: Error) => commandObject.onError(e));
  } catch (error) {
    log({
      header: "Command Error",
      payload: `${error}`,
      type: "Error",
    });
  }
};

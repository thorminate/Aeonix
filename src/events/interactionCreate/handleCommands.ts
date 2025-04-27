import {
  CacheType,
  CommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import log from "../../utils/log.js";
import Command from "../../interactions/command.js";
import Player from "../../models/player/player.js";
import Event, { EventParams } from "../../models/core/event.js";
import { findLocalCommands } from "../ready/01registerCommands.js";

export default new Event({
  callback: async (event: EventParams) => {
    const commandContext = event.context as CommandInteraction<CacheType>;

    if (!commandContext.isChatInputCommand()) return;

    const localCommands = await findLocalCommands();

    // check if command name is in localCommands
    const command: Command<boolean, boolean> | undefined = localCommands.find(
      (cmd: Command<boolean, boolean>) =>
        cmd.data.name === commandContext.commandName
    );

    // if commandObject does not exist, return
    if (!command) return;

    if (!commandContext.inGuild()) {
      await commandContext.reply({
        content: "Invalid command.",
        flags: command.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
      return;
    }

    if (command.acknowledge) {
      await commandContext.deferReply({
        flags: command.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!commandContext.member) {
      log({
        header: "Interaction member is falsy",
        processName: "CommandHandler",
        payload: commandContext,
        type: "Error",
      });
      return;
    }

    // if command is devOnly and user is not an admin, return
    if (command.adminOnly) {
      if (
        !(commandContext.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        commandContext.editReply({
          content: "Only administrators can run this command",
        });
        return;
      }
    }

    // if command requires permissions and user does not have aforementioned permission, return
    if (command.permissionsRequired?.length) {
      for (const permission of command.permissionsRequired) {
        if (
          !(commandContext.member.permissions as PermissionsBitField).has(
            permission
          )
        ) {
          commandContext.editReply({
            content: "You don't have permissions to run this command.",
          });
          return;
        }
      }
    }

    let player: Player | undefined = undefined;

    if (command.passPlayer) {
      player = await Player.find(commandContext.user.username);

      if (!player) {
        commandContext.editReply({
          content: "You don't exist in the database, run the /init command.",
        });
        return;
      }
    }

    // if all goes well, run the commands callback function.
    await command.callback(commandContext, player as Player).catch((e) => {
      try {
        command.onError(e);
      } catch (e) {
        log({
          header: "Error in command error handler",
          processName: "CommandHandler",
          payload: e,
          type: "Error",
        });
      }
    });
  },
  onError: async (e: any) => {
    log({
      header: "A command could not be handled correctly",
      processName: "CommandHandler",
      payload: e,
      type: "Error",
    });
  },
});

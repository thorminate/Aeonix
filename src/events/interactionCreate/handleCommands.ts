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
    const context = event.context as CommandInteraction<CacheType>;

    if (!context.isChatInputCommand()) return;

    const localCommands = await findLocalCommands();

    // check if command name is in localCommands
    const command: Command<boolean, boolean> | undefined = localCommands.find(
      (cmd: Command<boolean, boolean>) => cmd.data.name === context.commandName
    );

    // if commandObject does not exist, return
    if (!command) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Invalid command.",
        flags: command.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
      return;
    }

    if (command.acknowledge) {
      await context.deferReply({
        flags: command.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "CommandHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    // if command is devOnly and user is not an admin, return
    if (command.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (command.acknowledge) {
          await context.editReply({
            content: "Only administrators can run this",
          });
          return;
        } else {
          await context.reply({
            content: "Only administrators can run this",
          });
          return;
        }
      }
    }

    if (command.permissionsRequired?.length) {
      for (const permission of command.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (command.acknowledge) {
            await context.editReply({
              content: "You don't have permissions to run this command.",
            });
            return;
          } else {
            context.reply({
              content: "You don't have permissions to run this command.",
            });
            return;
          }
        }
      }
    }

    let player: Player | undefined = undefined;

    if (command.passPlayer) {
      player = await Player.find(context.user.username);

      if (!player) {
        if (command.acknowledge) {
          await context.editReply({
            content: "You aren't a player. Register with the /init command.",
          });
          return;
        } else {
          context.reply({
            content: "You aren't a player. Register with the /init command.",
          });
          return;
        }
      }
    }

    // if all goes well, run the commands callback function.
    await command.callback(context, player as Player).catch((e) => {
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
  onError: async (e) => {
    log({
      header: "A command could not be handled correctly",
      processName: "CommandHandler",
      payload: e,
      type: "Error",
    });
  },
});

import {
  CacheType,
  CommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import log from "../../utils/log.js";
import Command, {
  CommandContext,
  SeeCommandErrorPropertyForMoreDetails_1,
  SeeCommandErrorPropertyForMoreDetails_2,
  SeeCommandErrorPropertyForMoreDetails_3,
} from "../../interactions/command.js";
import Player from "../../models/player/player.js";
import Event, { EventParams } from "../../models/core/event.js";
import Environment from "../../models/environment/environment.js";

export async function findLocalCommands() {
  const localCommands: Command<boolean, boolean, boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "commands")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Command<boolean, boolean, boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localCommands.push(commandObject);
  }

  return localCommands;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as CommandInteraction;

    if (!context.isChatInputCommand()) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localCommands = await findLocalCommands();

    // check if command name is in localCommands
    const command: Command<boolean, boolean, boolean, boolean> | undefined =
      localCommands.find(
        (cmd: Command<boolean, boolean, boolean, boolean>) =>
          cmd.data.name === context.commandName
      );

    // if commandObject does not exist, return
    if (!command) return;

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
            await context.reply({
              content: "You don't have permissions to run this command.",
            });
            return;
          }
        }
      }
    }

    let player: Player | undefined = undefined;

    let environment: Environment | undefined = undefined;

    if (command.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (command.acknowledge) {
          await context.editReply({
            content: "You aren't a player. Register with the /init command.",
          });
          return;
        } else {
          await context.reply({
            content: "You aren't a player. Register with the /init command.",
          });
          return;
        }
      }

      if (command.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (command.acknowledge) {
            await context.editReply({
              content: "You must be in your environment channel to run this.",
            });
            return;
          } else {
            await context.reply({
              content: "You must be in your environment channel to run this.",
            });
            return;
          }
        }
      }

      if (command.passEnvironment) {
        environment = await player.fetchEnvironment().catch(() => undefined);
      }
    }

    // if all goes well, run the commands callback function.
    await command
      .callback(
        context as CommandInteraction<CacheType> &
          CommandContext &
          SeeCommandErrorPropertyForMoreDetails_3 &
          SeeCommandErrorPropertyForMoreDetails_2 &
          SeeCommandErrorPropertyForMoreDetails_1,
        player as Player,
        environment as Environment
      )
      .catch((e) => {
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

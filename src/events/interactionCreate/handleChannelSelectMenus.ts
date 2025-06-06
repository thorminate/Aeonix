import {
  ChannelSelectMenuInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import ChannelSelectMenu from "../../interactions/channelSelectMenu.js";

async function findLocalChannelSelectMenus() {
  const localChannelSelectMenus: ChannelSelectMenu<boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const channelSelectMenuFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "channelSelectMenus")
  );

  for (const channelSelectMenuFile of channelSelectMenuFiles) {
    const filePath = path.resolve(channelSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const channelSelectMenu: ChannelSelectMenu<boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localChannelSelectMenus.push(channelSelectMenu);
  }

  return localChannelSelectMenus;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as ChannelSelectMenuInteraction;

    if (!context.isChannelSelectMenu()) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localChannelSelectMenus = await findLocalChannelSelectMenus();

    const channelSelectMenu: ChannelSelectMenu<boolean, boolean> | undefined =
      localChannelSelectMenus.find(
        (channelSelectMenu: ChannelSelectMenu<boolean, boolean>) =>
          channelSelectMenu.customId === context.customId
      );

    if (!channelSelectMenu) return;

    if (channelSelectMenu.acknowledge) {
      await context.deferReply({
        flags: channelSelectMenu.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "ChannelSelectMenuHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (channelSelectMenu.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (channelSelectMenu.acknowledge) {
          await context.editReply({
            content: "Only administrators can run this.",
          });
          return;
        } else {
          await context.reply({
            content: "Only administrators can run this.",
          });
          return;
        }
      }
    }

    if (channelSelectMenu.permissionsRequired?.length) {
      for (const permission of channelSelectMenu.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (channelSelectMenu.acknowledge) {
            await context.editReply({
              content: "You don't have permission to run this.",
            });
            return;
          } else {
            context.reply({
              content: "You don't have permission to run this.",
            });
            return;
          }
        }
      }
    }

    let player: Player | undefined;

    if (channelSelectMenu.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (channelSelectMenu.acknowledge) {
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

      if (channelSelectMenu.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (channelSelectMenu.acknowledge) {
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
    }

    await channelSelectMenu
      .callback(context, player as Player)
      .catch((e: unknown) => {
        try {
          channelSelectMenu.onError(e);
        } catch (e) {
          log({
            header: "Error in role select menu error handler",
            processName: "ChannelSelectMenuHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) =>
    log({
      header: "A role select menu could not be handled correctly",
      processName: "ChannelSelectMenuHandler",
      payload: e,
      type: "Error",
    }),
});

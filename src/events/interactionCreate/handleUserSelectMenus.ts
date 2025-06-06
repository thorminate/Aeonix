import {
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  UserSelectMenuInteraction,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import UserSelectMenu from "../../interactions/userSelectMenu.js";

async function findLocalUserSelectMenus() {
  const localUserSelectMenus: UserSelectMenu<boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const userSelectMenuFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "userSelectMenus")
  );

  for (const userSelectMenuFile of userSelectMenuFiles) {
    const filePath = path.resolve(userSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const userSelectMenu: UserSelectMenu<boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localUserSelectMenus.push(userSelectMenu);
  }

  return localUserSelectMenus;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as UserSelectMenuInteraction;

    if (!context.isUserSelectMenu()) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localUserSelectMenus = await findLocalUserSelectMenus();

    const userSelectMenu: UserSelectMenu<boolean, boolean> | undefined =
      localUserSelectMenus.find(
        (userSelectMenu: UserSelectMenu<boolean, boolean>) =>
          userSelectMenu.customId === context.customId
      );

    if (!userSelectMenu) return;

    if (userSelectMenu.acknowledge) {
      await context.deferReply({
        flags: userSelectMenu.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "UserSelectMenuHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (userSelectMenu.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (userSelectMenu.acknowledge) {
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

    if (userSelectMenu.permissionsRequired?.length) {
      for (const permission of userSelectMenu.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (userSelectMenu.acknowledge) {
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

    if (userSelectMenu.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (userSelectMenu.acknowledge) {
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

      if (userSelectMenu.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (userSelectMenu.acknowledge) {
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

    await userSelectMenu
      .callback(context, player as Player)
      .catch((e: unknown) => {
        try {
          userSelectMenu.onError(e);
        } catch (e) {
          log({
            header: "Error in user select menu error handler",
            processName: "UserSelectMenuHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) =>
    log({
      header: "A user select menu could not be handled correctly",
      processName: "UserSelectMenuHandler",
      payload: e,
      type: "Error",
    }),
});

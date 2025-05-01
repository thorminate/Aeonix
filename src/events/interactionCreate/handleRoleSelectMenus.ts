import {
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  RoleSelectMenuInteraction,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import RoleSelectMenu from "../../interactions/roleSelectMenu.js";

async function findLocalRoleSelectMenus() {
  const localRoleSelectMenus: RoleSelectMenu<boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const roleSelectMenuFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "roleSelectMenus")
  );

  for (const roleSelectMenuFile of roleSelectMenuFiles) {
    const filePath = path.resolve(roleSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const roleSelectMenu: RoleSelectMenu<boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localRoleSelectMenus.push(roleSelectMenu);
  }

  return localRoleSelectMenus;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as RoleSelectMenuInteraction;

    if (!context.isRoleSelectMenu()) return;

    const localRoleSelectMenus = await findLocalRoleSelectMenus();

    const roleSelectMenu: RoleSelectMenu<boolean, boolean> | undefined =
      localRoleSelectMenus.find(
        (roleSelectMenu: RoleSelectMenu<boolean, boolean>) =>
          roleSelectMenu.customId === context.customId
      );

    if (!roleSelectMenu) return;

    if (!context.inGuild()) {
      log({
        header: "Interaction is not in a guild",
        processName: "RoleSelectMenuHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (roleSelectMenu.acknowledge) {
      await context.deferReply({
        flags: roleSelectMenu.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "RoleSelectMenuHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (roleSelectMenu.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (roleSelectMenu.acknowledge) {
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

    if (roleSelectMenu.permissionsRequired?.length) {
      for (const permission of roleSelectMenu.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (roleSelectMenu.acknowledge) {
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

    if (roleSelectMenu.passPlayer) {
      player = await Player.find(context.user.username);

      if (!player) {
        if (roleSelectMenu.acknowledge) {
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

    await roleSelectMenu
      .callback(context, player as Player)
      .catch((e: unknown) => {
        try {
          roleSelectMenu.onError(e);
        } catch (e) {
          log({
            header: "Error in role select menu error handler",
            processName: "RoleSelectMenuHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) =>
    log({
      header: "A role select menu could not be handled correctly",
      processName: "RoleSelectMenuHandler",
      payload: e,
      type: "Error",
    }),
});

import {
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  StringSelectMenuInteraction,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import StringSelectMenu from "../../interactions/stringSelectMenu.js";

async function findLocalStringSelectMenus() {
  const localStringSelectMenus: StringSelectMenu<boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const stringSelectMenuFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "stringSelectMenus")
  );

  for (const stringSelectMenuFile of stringSelectMenuFiles) {
    const filePath = path.resolve(stringSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const stringSelectMenu: StringSelectMenu<boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localStringSelectMenus.push(stringSelectMenu);
  }

  return localStringSelectMenus;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as StringSelectMenuInteraction;

    if (!context.isStringSelectMenu()) return;

    const localStringSelectMenus = await findLocalStringSelectMenus();

    const stringSelectMenu: StringSelectMenu<boolean, boolean> | undefined =
      localStringSelectMenus.find(
        (stringSelectMenu: StringSelectMenu<boolean, boolean>) =>
          stringSelectMenu.customId === context.customId
      );

    if (!stringSelectMenu) return;

    if (!context.inGuild()) {
      log({
        header: "Interaction is not in a guild",
        processName: "StringSelectMenuHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (stringSelectMenu.acknowledge) {
      await context.deferReply({
        flags: stringSelectMenu.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "StringSelectMenuHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (stringSelectMenu.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (stringSelectMenu.acknowledge) {
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

    if (stringSelectMenu.permissionsRequired?.length) {
      for (const permission of stringSelectMenu.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (stringSelectMenu.acknowledge) {
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

    if (stringSelectMenu.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (stringSelectMenu.acknowledge) {
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

    await stringSelectMenu
      .callback(context, player as Player)
      .catch((e: unknown) => {
        try {
          stringSelectMenu.onError(e);
        } catch (e) {
          log({
            header: "Error in string select menu error handler",
            processName: "StringSelectMenuHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) =>
    log({
      header: "A string select menu could not be handled correctly",
      processName: "StringSelectMenuHandler",
      payload: e,
      type: "Error",
    }),
});

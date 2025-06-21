import {
  CacheType,
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
import Interaction, {
  SeeInteractionErrorPropertyForMoreDetails_1,
  SeeInteractionErrorPropertyForMoreDetails_2,
  SeeInteractionErrorPropertyForMoreDetails_3,
  StringSelectMenuContext,
} from "../../interactions/interaction.js";
import Environment from "../../models/environment/environment.js";

async function findLocalStringSelectMenus() {
  const localStringSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "stringSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const stringSelectMenuFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "stringSelectMenus")
  );

  for (const stringSelectMenuFile of stringSelectMenuFiles) {
    const filePath = path.resolve(stringSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const stringSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "stringSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localStringSelectMenus.push(stringSelectMenu);
  }

  return localStringSelectMenus;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as StringSelectMenuInteraction;

    if (!context.isStringSelectMenu()) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localStringSelectMenus = await findLocalStringSelectMenus();

    const stringSelectMenu:
      | Interaction<boolean, boolean, boolean, boolean, "stringSelectMenu">
      | undefined = localStringSelectMenus.find(
      (
        stringSelectMenu: Interaction<
          boolean,
          boolean,
          boolean,
          boolean,
          "stringSelectMenu"
        >
      ) => stringSelectMenu.customId === context.customId
    );

    if (!stringSelectMenu) return;

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

    let environment: Environment | undefined;

    if (stringSelectMenu.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (stringSelectMenu.acknowledge) {
          await context.editReply({
            content: "You aren't a player. Register with the `/init` command.",
          });
          return;
        } else {
          context.reply({
            content: "You aren't a player. Register with the `/init` command.",
          });
          return;
        }
      }

      if (stringSelectMenu.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (stringSelectMenu.acknowledge) {
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

      if (stringSelectMenu.passEnvironment) {
        environment = await player.fetchEnvironment();
      }
    }

    await stringSelectMenu
      .callback(
        context as StringSelectMenuInteraction<CacheType> &
          StringSelectMenuContext &
          SeeInteractionErrorPropertyForMoreDetails_1 &
          SeeInteractionErrorPropertyForMoreDetails_2 &
          SeeInteractionErrorPropertyForMoreDetails_3,
        player as Player,
        environment as Environment
      )
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

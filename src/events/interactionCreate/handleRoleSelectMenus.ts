import {
  CacheType,
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
import Interaction, {
  RoleSelectMenuContext,
  SeeInteractionErrorPropertyForMoreDetails_1,
  SeeInteractionErrorPropertyForMoreDetails_2,
  SeeInteractionErrorPropertyForMoreDetails_3,
} from "../../interactions/interaction.js";
import Environment from "../../models/environment/environment.js";

async function findLocalRoleSelectMenus() {
  const localRoleSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "roleSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const roleSelectMenuFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "roleSelectMenus")
  );

  for (const roleSelectMenuFile of roleSelectMenuFiles) {
    const filePath = path.resolve(roleSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const roleSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "roleSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localRoleSelectMenus.push(roleSelectMenu);
  }

  return localRoleSelectMenus;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as RoleSelectMenuInteraction;

    if (!context.isRoleSelectMenu()) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localRoleSelectMenus = await findLocalRoleSelectMenus();

    const roleSelectMenu:
      | Interaction<boolean, boolean, boolean, boolean, "roleSelectMenu">
      | undefined = localRoleSelectMenus.find(
      (
        roleSelectMenu: Interaction<
          boolean,
          boolean,
          boolean,
          boolean,
          "roleSelectMenu"
        >
      ) => roleSelectMenu.customId === context.customId
    );

    if (!roleSelectMenu) return;

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

    let environment: Environment | undefined;

    if (roleSelectMenu.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (roleSelectMenu.acknowledge) {
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

      if (roleSelectMenu.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (roleSelectMenu.acknowledge) {
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

      if (roleSelectMenu.passEnvironment) {
        environment = await player.fetchEnvironment();
      }
    }

    await roleSelectMenu
      .callback(
        context as RoleSelectMenuInteraction<CacheType> &
          RoleSelectMenuContext &
          SeeInteractionErrorPropertyForMoreDetails_3 &
          SeeInteractionErrorPropertyForMoreDetails_2 &
          SeeInteractionErrorPropertyForMoreDetails_1,
        player as Player,
        environment as Environment
      )
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

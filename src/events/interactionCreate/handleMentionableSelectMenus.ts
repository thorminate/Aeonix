import {
  CacheType,
  MentionableSelectMenuInteraction,
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
import Environment from "../../models/environment/environment.js";
import Interaction, {
  MentionableSelectMenuContext,
  SeeInteractionErrorPropertyForMoreDetails_1,
  SeeInteractionErrorPropertyForMoreDetails_2,
  SeeInteractionErrorPropertyForMoreDetails_3,
} from "../../interactions/interaction.js";

async function findLocalMentionableSelectMenus() {
  const localMentionableSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "mentionableSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const mentionableSelectMenuFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "mentionableSelectMenus")
  );

  for (const mentionableSelectMenuFile of mentionableSelectMenuFiles) {
    const filePath = path.resolve(mentionableSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const mentionableSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "mentionableSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localMentionableSelectMenus.push(mentionableSelectMenu);
  }

  return localMentionableSelectMenus;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as MentionableSelectMenuInteraction;

    if (!context.isMentionableSelectMenu()) return;

    const localMentionableSelectMenus = await findLocalMentionableSelectMenus();

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const mentionableSelectMenu:
      | Interaction<boolean, boolean, boolean, boolean, "mentionableSelectMenu">
      | undefined = localMentionableSelectMenus.find(
      (
        mentionableSelectMenu: Interaction<
          boolean,
          boolean,
          boolean,
          boolean,
          "mentionableSelectMenu"
        >
      ) => mentionableSelectMenu.customId === context.customId
    );

    if (!mentionableSelectMenu) return;

    if (mentionableSelectMenu.acknowledge) {
      await context.deferReply({
        flags: mentionableSelectMenu.ephemeral
          ? MessageFlags.Ephemeral
          : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "MentionableSelectMenuHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (mentionableSelectMenu.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (mentionableSelectMenu.acknowledge) {
          await context.editReply({
            content: "Only administrators can run this.",
          });
          return;
        } else {
          context.reply({
            content: "Only administrators can run this.",
          });
          return;
        }
      }
    }

    if (mentionableSelectMenu.permissionsRequired?.length) {
      for (const permission of mentionableSelectMenu.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (mentionableSelectMenu.acknowledge) {
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

    if (mentionableSelectMenu.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (mentionableSelectMenu.acknowledge) {
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

      if (mentionableSelectMenu.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (mentionableSelectMenu.acknowledge) {
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

      if (mentionableSelectMenu.passEnvironment) {
        environment = await player.fetchEnvironment();
      }
    }

    await mentionableSelectMenu
      .callback({
        context,
        player,
        environment,
      } as {
        error: never;
        context: MentionableSelectMenuInteraction<CacheType> &
          MentionableSelectMenuContext &
          SeeInteractionErrorPropertyForMoreDetails_1 &
          SeeInteractionErrorPropertyForMoreDetails_2 &
          SeeInteractionErrorPropertyForMoreDetails_3;
        player: Player;
        environment: Environment;
      })
      .catch((e: unknown) => {
        try {
          mentionableSelectMenu.onError(e);
        } catch (e) {
          log({
            header: "Error in mentionable select menu error handler",
            processName: "MentionableSelectMenuHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) =>
    log({
      header: "A mentionable select menu could not be handled correctly",
      processName: "MentionableSelectMenuHandler",
      payload: e,
      type: "Error",
    }),
});

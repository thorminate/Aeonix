import {
  ButtonInteraction,
  CacheType,
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
  ButtonContext,
  SeeInteractionErrorPropertyForMoreDetails_1,
  SeeInteractionErrorPropertyForMoreDetails_2,
  SeeInteractionErrorPropertyForMoreDetails_3,
} from "../../interactions/interaction.js";

async function findLocalButtons() {
  const localButtons: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "button"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const buttonFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "buttons")
  );

  for (const buttonFile of buttonFiles) {
    const filePath = path.resolve(buttonFile);
    const fileUrl = url.pathToFileURL(filePath);
    const buttonObject: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "button"
    > = (await import(fileUrl.toString())).default;

    localButtons.push(buttonObject);
  }

  return localButtons;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as ButtonInteraction;

    if (!context.isButton()) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localButtons = await findLocalButtons();

    const button:
      | Interaction<boolean, boolean, boolean, boolean, "button">
      | undefined = localButtons.find(
      (button: Interaction<boolean, boolean, boolean, boolean, "button">) =>
        button.customId === context.customId
    );

    if (!button) return;

    if (button.acknowledge) {
      await context.deferReply({
        flags: button.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "ButtonHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (button.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (button.acknowledge) {
          await context.editReply({
            content: "Only administrators can press this button.",
          });
          return;
        } else {
          context.reply({
            content: "Only administrators can press this button.",
          });
          return;
        }
      }
    }

    if (button.permissionsRequired?.length) {
      for (const permission of button.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (button.acknowledge) {
            await context.editReply({
              content: "You don't have permissions to press this button.",
            });
            return;
          } else {
            context.reply({
              content: "You don't have permissions to press this button.",
            });
            return;
          }
        }
      }
    }

    let player: Player | undefined;

    let environment: Environment | undefined;

    if (button.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (button.acknowledge) {
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

      if (button.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (button.acknowledge) {
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

      if (button.passEnvironment) {
        environment = await player.fetchEnvironment().catch(() => undefined);
      }
    }

    await button
      .callback({
        context,
        player,
        environment,
      } as {
        error: never;
        context: ButtonInteraction<CacheType> &
          ButtonContext &
          SeeInteractionErrorPropertyForMoreDetails_1 &
          SeeInteractionErrorPropertyForMoreDetails_2 &
          SeeInteractionErrorPropertyForMoreDetails_3;
        player: Player;
        environment: Environment;
      })
      .catch((e: unknown) => {
        try {
          button.onError(e);
        } catch (e) {
          log({
            header: "Error in button error handler",
            processName: "ButtonHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) =>
    log({
      header: "A button could not be handled correctly",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    }),
});

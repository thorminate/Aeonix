import {
  CacheType,
  MessageFlags,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import Player from "../../models/player/player.js";
import Interaction, {
  ModalContext,
  SeeInteractionErrorPropertyForMoreDetails_3,
  SeeInteractionErrorPropertyForMoreDetails_2,
  SeeInteractionErrorPropertyForMoreDetails_1,
} from "../../interactions/interaction.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import Environment from "../../models/environment/environment.js";

async function findLocalModals() {
  const localModals: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "modal"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const modalFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "modals")
  );

  for (const modalFile of modalFiles) {
    const filePath = path.resolve(modalFile);
    const fileUrl = url.pathToFileURL(filePath);
    const modal: Interaction<boolean, boolean, boolean, boolean, "modal"> = (
      await import(fileUrl.toString())
    ).default;

    localModals.push(modal);
  }

  return localModals;
}

export default new Event({
  callback: async (event: EventParams) => {
    const context = event.context as ModalSubmitInteraction;

    if (!context.isModalSubmit()) return;

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localModals = await findLocalModals();

    const modal:
      | Interaction<boolean, boolean, boolean, boolean, "modal">
      | undefined = localModals.find(
      (modal: Interaction<boolean, boolean, boolean, boolean, "modal">) =>
        modal.customId === context.customId
    );

    if (!modal) return;

    if (modal.acknowledge) {
      await context.deferReply({
        flags: modal.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "ModalHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (modal.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (modal.acknowledge) {
          await context.editReply({
            content: "Only administrators can submit this modal.",
          });
          return;
        } else {
          await context.reply({
            content: "Only administrators can submit this modal.",
          });
          return;
        }
      }
    }

    if (modal.permissionsRequired?.length) {
      for (const permission of modal.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (modal.acknowledge) {
            await context.editReply({
              content: "You don't have permission to submit this modal.",
            });
            return;
          } else {
            context.reply({
              content: "You don't have permission to submit this modal.",
            });
            return;
          }
        }
      }
    }

    let player: Player | undefined = undefined;

    let environment: Environment | undefined = undefined;

    if (modal.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (modal.acknowledge) {
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

      if (modal.environmentOnly) {
        if (player.locationChannelId !== context.channelId) {
          if (modal.acknowledge) {
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

      if (modal.passEnvironment) {
        environment = await player.fetchEnvironment();
      }
    }

    await modal
      .callback({
        context,
        player,
        environment,
      } as {
        error: never;
        context: ModalSubmitInteraction<CacheType> &
          ModalContext &
          SeeInteractionErrorPropertyForMoreDetails_1 &
          SeeInteractionErrorPropertyForMoreDetails_2 &
          SeeInteractionErrorPropertyForMoreDetails_3;
        player: Player;
        environment: Environment;
      })
      .catch((e: unknown) => {
        try {
          modal.onError(e);
        } catch (e) {
          log({
            header: "Error in modal error handler",
            processName: "ModalHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) => {
    log({
      header: "A modal could not be handled correctly",
      processName: "ModalHandler",
      payload: e,
      type: "Error",
    });
  },
});

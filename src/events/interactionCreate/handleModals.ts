import {
  MessageFlags,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import Player from "../../models/player/player.js";
import Modal from "../../interactions/modal.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";

async function findLocalModals() {
  const localCommands: Modal<boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "modals")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Modal<boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localCommands.push(commandObject);
  }

  return localCommands;
}

export default new Event({
  callback: async (event: EventParams) => {
    const modalContext = event.context as ModalSubmitInteraction;

    if (!modalContext.isModalSubmit()) return;

    const localModals = await findLocalModals();
    // check if command name is in localCommands
    const modal: Modal<boolean, boolean> | undefined = localModals.find(
      (modal: Modal<boolean, boolean>) =>
        modal.customId === modalContext.customId
    );

    // if commandObject does not exist, return
    if (!modal) return;

    if (!modalContext.inGuild()) {
      log({
        header: "Modal submit interaction not in guild",
        processName: "ModalHandler",
        payload: modalContext,
        type: "Error",
      });
      return;
    }

    if (modal.acknowledge) {
      await modalContext.deferReply({
        flags: modal.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!modalContext.member) {
      log({
        header: "Interaction member is falsy",
        processName: "ModalHandler",
        payload: modalContext,
        type: "Error",
      });
      return;
    }

    // if command is devOnly and user is not an admin, return
    if (modal.adminOnly) {
      if (
        !(modalContext.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        modalContext.editReply({
          content: "Only administrators can submit this modal.",
        });
        return;
      }
    }

    // if button requires permissions and user does not have aforementioned permission, return
    if (modal.permissionsRequired?.length) {
      for (const permission of modal.permissionsRequired) {
        if (
          !(modalContext.member.permissions as PermissionsBitField).has(
            permission
          )
        ) {
          modalContext.editReply({
            content: "You don't have permissions to submit this modal.",
          });
          return;
        }
      }
    }

    let player: Player | undefined = undefined;

    if (modal.passPlayer) {
      player = await Player.find(modalContext.user.username);

      if (!player) {
        modalContext.editReply({
          content: "You don't exist in the DB, run the /init command.",
        });
        return;
      }
    }

    // if all goes well, run the button's callback function.
    await modal.callback(modalContext, player as Player).catch((e: unknown) => {
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

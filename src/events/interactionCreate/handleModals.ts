import {
  MessageFlags,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import Player from "../../models/Game/Player/Player.js";
import Modal from "../../utils/modal.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/Core/Event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";

async function findLocalModals() {
  let localCommands: Modal[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "modals")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Modal = (await import(fileUrl.toString())).default;

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
    const modal: Modal = localModals.find(
      (modal: Modal) => modal.customId === modalContext.customId
    );

    // if commandObject does not exist, return
    if (!modal) return;

    // if command is devOnly and user is not an admin, return
    if (modal.adminOnly) {
      if (
        !(modalContext.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        modalContext.reply({
          content: "Only administrators can run this command",
          flags: MessageFlags.Ephemeral,
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
          modalContext.reply({
            content: "You don't have permissions to press this button.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }

    let player: Player;

    if (modal.passPlayer) {
      player = await Player.find(modalContext.user.username);

      if (!player) {
        modalContext.reply({
          content: "You don't exist in the DB, run the /init command.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // if all goes well, run the button's callback function.
    await modal
      .callback(modalContext, player)
      .catch((e: Error) => modal.onError(e));
  },
  onError: async (e: any) => {
    log({
      header: "A modal could not be handled correctly",
      processName: "ModalHandler",
      payload: e,
      type: "Error",
    });
  },
});

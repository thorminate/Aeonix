import {
  ButtonBuilder,
  ButtonStyle,
  GuildMemberRoleManager,
  MessageFlags,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import Player from "../../models/player/Player.js";
import { Event } from "../../handlers/eventHandler.js";
import buttonWrapper from "../../buttons/buttonWrapper.js";
import getLocalModals from "../../modals/getLocalModals.js";
import Modal from "../../modals/modal.js";
import log from "../../utils/log.js";

export default async (event: Event) => {
  const modalContext = event.arg as ModalSubmitInteraction;

  if (!modalContext.isModalSubmit()) return;

  const localModals = await getLocalModals();

  try {
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
      player = await Player.load(modalContext.user.username);

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
  } catch (error) {
    log({
      header: "Button Error",
      payload: error,
      type: "Error",
    });
  }
};

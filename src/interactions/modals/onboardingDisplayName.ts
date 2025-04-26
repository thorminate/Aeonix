import {
  ButtonBuilder,
  ButtonStyle,
  GuildMemberRoleManager,
  MessageFlags,
} from "discord.js";
import Player from "../../models/game/player/player.js";
import log from "../../utils/log.js";
import Modal from "../modal.js";
import buttonWrapper from "../../utils/buttonWrapper.js";

export default new Modal({
  customId: "onboardingDisplayName",

  callback: async (modalContext) => {
    const displayName = modalContext.fields.getTextInputValue("display-name");

    if (await Player.find(modalContext.user.username)) {
      const buttons = buttonWrapper(
        new ButtonBuilder()
          .setCustomId("deletePlayer")
          .setLabel("Delete?")
          .setStyle(ButtonStyle.Danger)
      );

      await modalContext.reply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const player = new Player(modalContext.user, displayName);

    await player.save();

    if (!modalContext.member) {
      log({
        header: "Interaction member is falsy",
        processName: "OnboardingDisplayNameModal",
        payload: modalContext,
        type: "Error",
      });
      return;
    }

    const playerRole = process.env["PLAYER_ROLE"];

    if (!playerRole) {
      log({
        header: "Player role not found in environment variables",
        processName: "OnboardingDisplayNameModal",
        type: "Error",
      });
      return;
    }

    await (modalContext.member.roles as GuildMemberRoleManager).add(playerRole);

    await modalContext.reply({
      content: "1/1 - Your persona has been created.",
      flags: MessageFlags.Ephemeral,
    });
  },

  onError: async (error: unknown) => {
    log({
      header: "Modal Error",
      processName: "OnboardingDisplayNameModal",
      payload: error,
      type: "Error",
    });
  },
});

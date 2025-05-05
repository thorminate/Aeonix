import {
  ActionRowBuilder,
  GuildChannel,
  GuildMemberRoleManager,
  ModalBuilder,
  OverwriteType,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Modal from "../modal.js";
import deletePlayer from "../buttons/deletePlayer.js";
import componentWrapper from "../../utils/componentWrapper.js";
import aeonix from "../../aeonix.js";

export default new Modal({
  data: new ModalBuilder()
    .setTitle("Step 1/1 - Display Name")
    .setCustomId("onboardingDisplayName")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("display-name")
          .setLabel("Display name/Character Name")
          .setPlaceholder("Name of your character within this world.")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(32)
          .setMinLength(2)
      )
    ),
  customId: "onboardingDisplayName",
  ephemeral: true,
  passPlayer: false,
  acknowledge: true,

  callback: async (context) => {
    const displayName = context.fields.getTextInputValue("display-name");

    if (await Player.find(context.user.id)) {
      const buttons = componentWrapper(deletePlayer.data);

      await context.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const player = new Player(context.user, displayName);

    await player.save();

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "OnboardingDisplayNameModal",
        payload: context,
        type: "Error",
      });
      return;
    }

    const playerRole = process.env.PLAYER_ROLE;

    if (!playerRole) {
      log({
        header: "Player role not found in environment variables",
        processName: "OnboardingDisplayNameModal",
        type: "Error",
      });
      return;
    }

    const startChannel = await aeonix.channels
      .fetch(process.env.START_ENV_CHANNEL || "")
      .catch((e) => {
        log({
          header: "Start channel not found",
          processName: "OnboardingDisplayNameModal",
          payload: e,
          type: "Error",
        });
      });

    if (!startChannel) {
      log({
        header: "Start channel not found",
        processName: "OnboardingDisplayNameModal",
        type: "Error",
      });
      return;
    }

    if (!startChannel.isTextBased()) {
      log({
        header: "Start channel is not a text channel",
        processName: "OnboardingDisplayNameModal",
        type: "Error",
      });
      return;
    }

    (startChannel as GuildChannel).permissionOverwrites.create(
      context.user,
      {
        ViewChannel: true,
      },
      {
        reason: "Onboarding",
        type: OverwriteType.Member,
      }
    );

    await (context.member.roles as GuildMemberRoleManager).add(playerRole);

    await context.editReply({
      content: "1/1 - Your persona has been created.",
    });
  },

  onError: (e) => {
    log({
      header: "Modal Error",
      processName: "OnboardingDisplayNameModal",
      payload: e,
      type: "Error",
    });
  },
});

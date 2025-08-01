import {
  ActionRowBuilder,
  GuildMemberRoleManager,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import deletePlayer from "../buttons/deletePlayer.js";
import componentWrapper from "../../utils/componentWrapper.js";
import Interaction, { ITypes } from "../../models/core/interaction.js";
import TutorialQuestLetter from "../letters/tutorialQuestLetter.js";

async function isImageUrl(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type");
    return contentType && contentType.startsWith("image/");
  } catch {
    return false;
  }
}

export default new Interaction({
  data: new ModalBuilder()
    .setTitle("Step 1/1 - Display Name")
    .setCustomId("onboarding1")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("display-name")
          .setLabel("Display/Character Name")
          .setPlaceholder("Name of your character within this world.")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(32)
          .setMinLength(2)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("avatar-url")
          .setLabel("Avatar URL")
          .setPlaceholder("https://example.com/avatar.png")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    ),
  interactionType: ITypes.Modal,
  ephemeral: true,

  callback: async ({ context, aeonix }) => {
    if (aeonix.players.exists(context.user.id)) {
      const buttons = componentWrapper(deletePlayer.data);

      await context.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const displayName = context.fields.getTextInputValue("display-name");

    let avatarUrl = context.fields.getTextInputValue("avatar-url");

    if (!displayName) {
      await context.editReply({
        content: "Please enter a display name.",
      });
      return;
    }

    if (!avatarUrl) {
      avatarUrl = context.user.displayAvatarURL();
    }

    if (!(await isImageUrl(avatarUrl))) {
      await context.editReply({
        content:
          "Please enter a valid image URL. (Has to include a valid image extension like .png, .jpg, .jpeg, etc.)",
      });
      return;
    }

    const player = new Player(context.user, displayName, avatarUrl);

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "Onboarding1Modal",
        payload: context,
        type: "Error",
      });
      return;
    }

    const playerRole = aeonix.playerRoleId;

    if (!playerRole) {
      log({
        header: "Player role not found in environment variables",
        processName: "Onboarding1Modal",
        type: "Error",
      });
      return;
    }

    const startChannel = await (
      await aeonix.environments.get("start")
    )?.fetchChannel();

    if (!startChannel) {
      log({
        header: "Start channel not found",
        processName: "Onboarding1Modal",
        type: "Error",
      });
      return;
    }

    if (!startChannel.isTextBased()) {
      log({
        header: "Start channel is not a text channel",
        processName: "Onboarding1Modal",
        type: "Error",
      });
      return;
    }

    await (context.member.roles as GuildMemberRoleManager).add(playerRole);

    await player.moveTo("start", true, true, true);

    player.inbox.add(new TutorialQuestLetter());

    await player.commit();

    aeonix.players.set(player);

    await startChannel.send({
      content: `<@${context.user.id}> has joined the game! Please check your inbox for further instructions (\`/inbox\`).`,
    });

    await context.editReply({
      content: "1/1 - Your persona has been created.",
    });
  },

  onError: (e) => {
    log({
      header: "Modal Error",
      processName: "Onboarding1Modal",
      payload: e,
      type: "Error",
    });
  },
});

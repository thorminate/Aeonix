import {
  ButtonBuilder,
  ButtonStyle,
  GuildMemberRoleManager,
  MessageFlags,
  ModalSubmitInteraction,
} from "discord.js";
import Player from "../../models/player/Player.js";
import { Event } from "../../handlers/eventHandler.js";
import buttonWrapper from "../../utils/buttonWrapper.js";

export default async (event: Event) => {
  const modalInteraction = event.arg as ModalSubmitInteraction;

  if (!modalInteraction.isModalSubmit()) return;

  switch (modalInteraction.customId) {
    case "onboarding-display-name":
      const displayName =
        modalInteraction.fields.getTextInputValue("display-name");

      if (await Player.load(modalInteraction.user.username)) {
        const buttons = buttonWrapper([
          new ButtonBuilder()
            .setCustomId("delete-player")
            .setLabel("Delete?")
            .setStyle(ButtonStyle.Danger),
        ]);

        await modalInteraction.reply({
          content:
            "You have already initialized your persona. Do you wish to delete it?",
          components: buttons,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const player = new Player(modalInteraction.user, displayName);

      await player.save();

      await (modalInteraction.member.roles as GuildMemberRoleManager).add(
        process.env.PLAYER_ROLE
      );

      await modalInteraction.reply({
        content: "1/1 - Your persona has been created.",
        flags: MessageFlags.Ephemeral,
      });

      break;
  }
};

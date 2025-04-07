import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Button from "../button.js";
import Player from "../../models/Game/player/Player.js";
import buttonWrapper from "../buttonWrapper.js";

export default <Button>{
  customId: "onboarding1",
  callback: async (buttonContext: ButtonInteraction) => {
    if (await Player.load(buttonContext.user.username)) {
      await buttonContext.reply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttonWrapper([
          new ButtonBuilder()
            .setCustomId("deletePlayer")
            .setLabel("Delete?")
            .setStyle(ButtonStyle.Danger),
        ]),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await buttonContext.showModal(
      new ModalBuilder()
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
        )
    );
  },
};

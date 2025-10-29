import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import log from "../../../utils/log.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/core/interaction.js";
import componentWrapper from "../../../utils/componentWrapper.js";
import deletePlayer from "../../buttons/deletePlayer/deletePlayer.js";

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
  interactionType: InteractionTypes.Modal,
  ephemeral: true,

  callback: async ({ context, aeonix }) => {
    const result = await aeonix.players.create({
      user: context.user,
      name: context.fields.getTextInputValue("display-name"),
      avatar: context.fields.getTextInputValue("avatar-url"),
    });

    if (result === "playerAlreadyExists") {
      const buttons = componentWrapper(deletePlayer.data);

      await context.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    if (result === "notAnImageUrl") {
      await context.editReply({
        content: "The avatar URL is not a valid image URL.",
      });
      return;
    }

    if (result === "internalError") {
      await context.editReply({
        content: "An internal error has occurred. Please try again later.",
      });
      return;
    }

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

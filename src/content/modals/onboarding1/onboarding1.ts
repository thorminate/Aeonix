import {
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";
import componentWrapper from "#utils/componentWrapper.js";
import deletePlayer from "#buttons/deletePlayer/deletePlayer.js";

export default new Interaction({
  data: new ModalBuilder()
    .setTitle("Step 1/1 - Persona Setup")
    .setCustomId("onboarding1")
    .addLabelComponents(
      new LabelBuilder()
        .setLabel("Display/Character Name")
        .setDescription("Your character's name within this world.")
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("display-name")
            .setPlaceholder("Cool Name")
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(32)
            .setMinLength(2)
        ),
      new LabelBuilder()
        .setLabel("Avatar URL")
        .setDescription(
          "The URL of your character's avatar. May be left blank and it will use your Discord avatar."
        )
        .setTextInputComponent(
          new TextInputBuilder()
            .setCustomId("avatar-url")
            .setPlaceholder("https://example.com/avatar.png")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        )
    ),

  // TODO: make this integrate into the race system and add multiple steps
  // TODO: change player processes to use a player ticker system and make the ticker "catch up" when its behind on ticks on a player. so if a player has been inactive for an hour, they will be caught up by 4 ticks (1 tick per 15 minutes) once they are active again.

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

  onError: (e, aeonix) => {
    aeonix.logger.error("Onboarding1Modal", "Modal Error", e);
  },
});

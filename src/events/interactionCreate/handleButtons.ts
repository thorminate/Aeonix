/**
 * Handles the button interactions.
 * @param {Client} bot The instantiating client.
 * @param {ButtonInteraction} interaction The interaction that ran the command.
 */

import {
  ActionRowBuilder,
  Client,
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js"; // Import the discord.js library.
import userData from "../../models/userDatabaseSchema"; // Import the user database schema.
import log from "../../utils/log";

export default async (bot: Client, buttonInteraction: ButtonInteraction) => {
  if (!buttonInteraction.isButton()) return;
  switch (buttonInteraction.customId) {
    // Onboarding buttons
    case "begin-onboarding":
      try {
        const onboardingButton = new ButtonBuilder()
          .setCustomId("onboarding-modal-start")
          .setLabel("Start")
          .setStyle(ButtonStyle.Danger);

        const reply = await buttonInteraction.reply({
          content: "Welcome to The System, future player!",
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              onboardingButton
            ),
          ],
          ephemeral: true,
        });

        setTimeout(() => {
          reply.delete();
        }, 15 * 1000);
      } catch (error) {
        console.error(error);
        log({
          header: "Error",
          payload: `${error}`,
          type: "error",
        });
      }
      break;

    case "onboarding-modal-start":
      try {
        const onboardingModal = new ModalBuilder()
          .setCustomId("onboarding-modal")
          .setTitle("Onboarding")
          .setComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId("onboarding-modal-name")
                .setLabel("Persona Name")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
                .setPlaceholder("This cannot be changed!")
                .setMaxLength(32)
                .setMinLength(3)
            )
          );

        await buttonInteraction.showModal(onboardingModal);
      } catch (error) {
        console.error(error);
        log({
          header: "Onboarding Error",
          payload: `${error}`,
          type: "error",
        });
      }
      break;
    // Edit environment modals
    case "edit-environment-items-button":
      try {
        const editEnvironmentItemsModal = new ModalBuilder()
          .setCustomId("edit-environment-items-modal")
          .setTitle("Edit Environment Items");

        const editEnvironmentItemsOperatorInput = new TextInputBuilder()
          .setCustomId("edit-environment-items-operator-input")
          .setLabel("Remove or Add")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        const editEnvironmentItemsValueInput = new TextInputBuilder()
          .setCustomId("edit-environment-items-value-input")
          .setLabel("Item name")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        const editEnvironmentItemsOperatorRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            editEnvironmentItemsOperatorInput
          );

        const editEnvironmentItemsValueRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            editEnvironmentItemsValueInput
          );

        editEnvironmentItemsModal.addComponents(
          editEnvironmentItemsOperatorRow,
          editEnvironmentItemsValueRow
        );

        await buttonInteraction.showModal(editEnvironmentItemsModal);
      } catch (error) {
        console.error(error);
        log({
          header: "Error",
          payload: `${error}`,
          type: "error",
        });
      }
      break;

    case "edit-environment-users-button":
      try {
        const editEnvironmentUsersModal = new ModalBuilder()
          .setCustomId("edit-environment-users-modal")
          .setTitle("Edit Environment Users");

        const editEnvironmentUsersOperatorInput = new TextInputBuilder()
          .setCustomId("edit-environment-users-operator-input")
          .setLabel("Operator")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        const editEnvironmentUsersInput = new TextInputBuilder()
          .setCustomId("edit-environment-users-input")
          .setLabel("User ID")
          .setRequired(true)
          .setStyle(TextInputStyle.Short);

        const editEnvironmentUsersOperatorRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            editEnvironmentUsersOperatorInput
          );

        const editEnvironmentUsersInputRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            editEnvironmentUsersInput
          );

        editEnvironmentUsersModal.addComponents(
          editEnvironmentUsersOperatorRow,
          editEnvironmentUsersInputRow
        );

        await buttonInteraction.showModal(editEnvironmentUsersModal);
      } catch (error) {
        console.log(error);
        log({
          header: "Error",
          payload: `${error}`,
          type: "error",
        });
      }
      break;

    case "edit-environment-channels-button":
      try {
        const editEnvironmentChannelsModal = new ModalBuilder()
          .setCustomId("edit-environment-channels-modal")
          .setTitle("Edit Environment Channels");

        const editEnvironmentChannelsValueInput = new TextInputBuilder()
          .setCustomId("edit-environment-channels-value-input")
          .setLabel("Value")
          .setRequired(true)
          .setStyle(TextInputStyle.Short)
          .setMinLength(18);

        const editEnvironmentChannelsValueRow =
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            editEnvironmentChannelsValueInput
          );

        editEnvironmentChannelsModal.addComponents(
          editEnvironmentChannelsValueRow
        );

        await buttonInteraction.showModal(editEnvironmentChannelsModal);
      } catch (error) {
        console.log(error);
        log({
          header: "Error editing environment channels",
          payload: `${error}`,
          type: "error",
        });
      }
      break;
  }
};

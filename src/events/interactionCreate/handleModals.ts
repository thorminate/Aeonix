/**
 * Handles the modals.
 * @param {Client} bot The instantiating client.
 * @param {Interaction} modalInteraction The interaction that ran the command.
 */
import {
  ButtonBuilder,
  ButtonStyle,
  ModalSubmitInteraction,
  Client,
  GuildMemberRoleManager,
  TextChannel,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} from "discord.js";
import buttonWrapper from "../../utils/buttonWrapper";
import UserData from "../../models/userDatabaseSchema";
import itemData from "../../models/itemDatabaseSchema";
import environmentData from "../../models/environmentDatabaseSchema";
import ms from "ms";
import { Document } from "mongoose";
import actions from "../../actions/actionIndex";
import path from "path";
import log from "../../utils/log";

export default async (
  bot: Client,
  modalInteraction: ModalSubmitInteraction
) => {
  // Export the function
  if (!modalInteraction.isModalSubmit()) return;
  try {
    switch (
      modalInteraction.customId // Switch on the (pretty self-explanatory) custom IDs
    ) {
      //region Admin modals
      // Stat Modal
      case "stats-giver-modal":
        // get input values

        const statAmount = parseInt(
          modalInteraction.fields.getTextInputValue("stats-giver-input")
        );
        const statsTargetUserInput = modalInteraction.fields.getTextInputValue(
          "stats-giver-target-input"
        );

        const variant = modalInteraction.fields.getTextInputValue(
          "stats-giver-variant-input"
        );

        const modifier = modalInteraction.fields.getTextInputValue(
          "stats-giver-modifier-input"
        );

        if (
          variant !== "strength" &&
          variant !== "will" &&
          variant !== "cognition" &&
          variant !== "level" &&
          variant !== "exp"
        ) {
          // Check if the variant is not a valid variant
          await modalInteraction.reply({
            // Reply with an error message if so
            content:
              "Please enter a valid variant. Valid variants are 'strength', 'will', 'cognition', 'level', and 'exp'.",
            ephemeral: true,
          });
          return;
        }

        if (modifier !== "add" && modifier !== "remove" && modifier !== "set") {
          // Check if the modifier is not a valid modifier
          await modalInteraction.reply({
            // Reply with an error message if so
            content:
              "Please enter a valid modifier. Valid modifiers are 'add', 'remove', and 'set'.",
            ephemeral: true,
          });
          return;
        }

        if (isNaN(statAmount) || statAmount < 0) {
          // Check if the stat amount is not a valid number
          await modalInteraction.reply({
            // Reply with an error message if so
            content: "Please enter a valid positive number for the stat amount",
            ephemeral: true,
          });
          return;
        }

        actions.user.giveStat(modalInteraction, {
          variant,
          modifier,
          amount: statAmount,
          userId: statsTargetUserInput,
        });
        break;

      // Skill Modals
      case "create-skill-modal":
        // get input values

        const createSkillName = modalInteraction.fields
          .getTextInputValue("create-skill-name-input")
          .toLowerCase();
        const createSkillDescription =
          modalInteraction.fields.getTextInputValue(
            "create-skill-description-input"
          );
        const createSkillAction = modalInteraction.fields.getTextInputValue(
          "create-skill-action-input"
        );
        const createSkillCooldown = parseInt(
          modalInteraction.fields.getTextInputValue(
            "create-skill-cooldown-input"
          )
        );
        const createSkillWill = parseInt(
          modalInteraction.fields.getTextInputValue("create-skill-will-input")
        );

        actions.skill.create(modalInteraction, {
          name: createSkillName,
          description: createSkillDescription,
          action: createSkillAction,
          cooldown: createSkillCooldown,
          will: createSkillWill,
        });
        break;

      case "delete-skill-modal":
        // get input values

        const deleteSkillName = modalInteraction.fields
          .getTextInputValue("delete-skill-name-input")
          .toLowerCase();

        await actions.skill.delete(modalInteraction, deleteSkillName);
        break;

      case "grant-skill-modal":
        // get input values

        const grantSkillName = modalInteraction.fields
          .getTextInputValue("grant-skill-name-input")
          .toLowerCase();
        const grantSkillTarget = modalInteraction.fields.getTextInputValue(
          "grant-skill-target-input"
        );

        await actions.skill.grant(modalInteraction, {
          skillName: grantSkillName,
          targetId: grantSkillTarget,
        });
        break;

      case "revoke-skill-modal":
        // get input values

        const revokeSkillName = modalInteraction.fields
          .getTextInputValue("revoke-skill-name-input")
          .toLowerCase();
        const revokeSkillTarget = modalInteraction.fields.getTextInputValue(
          "revoke-skill-target-input"
        );

        await actions.skill.revoke(modalInteraction, {
          skillName: revokeSkillName,
          targetId: revokeSkillTarget,
        });
        break;

      // Item Modals
      case "create-item-modal":
        // get input values

        const itemName = modalInteraction.fields
          .getTextInputValue("create-item-name-input")
          .toLowerCase();
        const itemDescription = modalInteraction.fields.getTextInputValue(
          "create-item-description-input"
        );
        const itemActionable = modalInteraction.fields
          .getTextInputValue("create-item-actionable-input")
          .toLowerCase();

        if (
          itemActionable !== "consume" &&
          itemActionable !== "use" &&
          itemActionable !== "interact"
        ) {
          await modalInteraction.reply({
            content:
              "Please enter a valid action. Valid actions are 'consume', 'use', and 'interact'.",
            ephemeral: true,
          });
          return;
        }

        actions.item.create(modalInteraction, {
          itemName,
          itemDescription: itemDescription,
          itemActionType: itemActionable,
        });

        break;

      case "give-item-modal":
        // get input values

        const giveItemName = modalInteraction.fields
          .getTextInputValue("give-item-name-input")
          .toLowerCase();

        const giveItemTarget = modalInteraction.fields.getTextInputValue(
          "give-item-target-input"
        );

        const giveItemAmount = parseInt(
          modalInteraction.fields.getTextInputValue("give-item-amount-input")
        );

        if (isNaN(giveItemAmount)) {
          await modalInteraction.reply({
            content: "Amount must be a number.",
            ephemeral: true,
          });
          return;
        }

        await actions.item.give(modalInteraction, {
          itemName: giveItemName,
          targetId: giveItemTarget,
          amount: giveItemAmount,
        });
        break;

      case "revoke-item-modal":
        // get input values

        const removeItemName = modalInteraction.fields
          .getTextInputValue("revoke-item-name-input")
          .toLowerCase();

        const removeItemTarget = modalInteraction.fields.getTextInputValue(
          "revoke-item-target-input"
        );

        await actions.item.revoke(modalInteraction, {
          itemName: removeItemName,
          targetId: removeItemTarget,
        });
        break;

      case "delete-item-modal":
        // get input values

        const deleteItemName = modalInteraction.fields
          .getTextInputValue("delete-item-name-input")
          .toLowerCase();

        // Validate the inputs

        await actions.item.delete(modalInteraction, deleteItemName);
        break;

      // Status Effect Modals
      case "create-status-effect-modal":
        // get input values

        const statusEffectName = modalInteraction.fields
          .getTextInputValue("create-status-effect-name-input")
          .toLowerCase();
        const statusEffectDuration = parseInt(
          modalInteraction.fields
            .getTextInputValue("create-status-effect-duration-input")
            .toLowerCase()
        );
        const statusEffectDescription =
          modalInteraction.fields.getTextInputValue(
            "create-status-effect-description-input"
          );

        if (isNaN(statusEffectDuration) || statusEffectDuration < 0) {
          await modalInteraction.reply({
            content: "Duration must be a valid positive number.",
            ephemeral: true,
          });
          return;
        }

        actions.statusEffect.create(modalInteraction, {
          name: statusEffectName,
          duration: statusEffectDuration,
          description: statusEffectDescription,
        });

        break;

      case "delete-status-effect-modal":
        // get input values

        const deleteStatusEffectName = modalInteraction.fields
          .getTextInputValue("delete-status-effect-name-input")
          .toLowerCase();

        // Validate the inputs
        actions.statusEffect.delete(modalInteraction, deleteStatusEffectName);

        break;

      case "grant-status-effect-modal":
        // get input values
        const grantStatusEffectName = modalInteraction.fields.getTextInputValue(
          "grant-status-effect-name-input"
        );
        const grantStatusEffectTarget =
          modalInteraction.fields.getTextInputValue(
            "grant-status-effect-target-input"
          );

        await actions.statusEffect.grant(modalInteraction, {
          statusEffectName: grantStatusEffectName,
          targetId: grantStatusEffectTarget,
        });
        break;

      // Environment Modals
      case "create-environment-modal":
        // get input values
        const createEnvironmentName = modalInteraction.fields
          .getTextInputValue("create-environment-name-input") // get name input
          .toLowerCase(); // convert to lowercase
        const createEnvironmentItemsPromises: Array<string> =
          modalInteraction.fields
            .getTextInputValue("create-environment-items-input") // get items input
            .toLowerCase() // convert to lowercase
            .split(",")
            .map((itemName) => itemName.trim()); // convert to array, split by comma
        const createEnvironmentChannel: string =
          // get channel input and convert to number
          modalInteraction.fields.getTextInputValue(
            "create-environment-channel-input"
          );

        await actions.environment.create(modalInteraction, {
          name: createEnvironmentName,
          items: createEnvironmentItemsPromises,
          channel: createEnvironmentChannel,
        });

      case "edit-environment-name-modal":
        // get input values
        const editEnvironmentName = modalInteraction.fields
          .getTextInputValue("edit-environment-name-input")
          .toLowerCase();

        const editEnvironmentNewName = modalInteraction.fields
          .getTextInputValue("edit-environment-new-name-input")
          .toLowerCase();

        // Validate and format the inputs
        const editEnvironmentNameData = await environmentData.findOne({
          name: editEnvironmentName,
        });

        if (editEnvironmentNameData) {
          editEnvironmentNameData.name = editEnvironmentNewName;
          await editEnvironmentNameData.save();

          await modalInteraction.reply({
            content: `Successfully renamed environment ${editEnvironmentName} to ${editEnvironmentNewName}.`,
            ephemeral: true,
          });
        } else {
          await modalInteraction.reply({
            content: "Environment not found!",
            ephemeral: true,
          });
        }
        break;

      case "edit-environment-items-modal":
        // get input values
        const editEnvironmentItemsName: string = modalInteraction.fields
          .getTextInputValue("edit-environment-name-input")
          .toLowerCase();

        const editEnvironmentItemsOperator =
          modalInteraction.fields.getTextInputValue(
            "edit-environment-items-operator-input"
          );
        const editEnvironmentItemsPromises: Array<string> =
          modalInteraction.fields
            .getTextInputValue("edit-environment-items-input")
            .toLowerCase()
            .split(",")
            .map((item) => item.trim());

        const editEnvironmentItemsData = await environmentData.findOne({
          name: editEnvironmentItemsName,
        });

        if (!editEnvironmentItemsData) {
          await modalInteraction.reply({
            content: "Environment not found!",
            ephemeral: true,
          });
          return;
        }

        const editEnvironmentItems: Array<Document | string> =
          await Promise.all(
            editEnvironmentItemsPromises.map(async (itemName: string) => {
              // for each item
              const item = await itemData.findOne({ name: itemName }); // get their corresponding data
              if (!item) return itemName;
              else return item;
            })
          );
        const editEnvironmentInvalidItems = editEnvironmentItems.filter(
          // filter out valid items into new array
          (item) => !item
        );
        if (editEnvironmentInvalidItems.length > 0) {
          // if there are invalid items
          await modalInteraction.reply({
            // say so verbosely
            content: `Items ${editEnvironmentInvalidItems
              .map((item, index) => editEnvironmentItems[index])
              .join(", ")} not found, make sure they exist in the database.`,
            ephemeral: true,
          });
          return;
        }
        switch (editEnvironmentItemsOperator) {
          case "add":
            if (
              editEnvironmentItemsData.items.includes(
                editEnvironmentItems.map((item: any) => item.itemName)
              )
            ) {
              await modalInteraction.reply({
                content: `Items ${editEnvironmentItems
                  .map((item: any) => item.itemName)
                  .join(
                    ", "
                  )} already in environment ${editEnvironmentItemsName}.`,
                ephemeral: true,
              });
              return;
            }
            editEnvironmentItemsData.items.push(
              ...editEnvironmentItems.map((item: any) => item.itemName)
            );

            await editEnvironmentItemsData.save();
            await modalInteraction.reply({
              content: `Successfully added item(s) ${editEnvironmentItems
                .map((item: any) => item.itemName)
                .join(", ")} to environment ${editEnvironmentItemsName}.`,
              ephemeral: true,
            });
            break;

          case "remove":
            editEnvironmentItemsData.items =
              editEnvironmentItemsData.items.filter(
                (itemName: string) =>
                  !editEnvironmentItems.some(
                    (item: any) => item.itemName === itemName
                  )
              );
            await editEnvironmentItemsData.save();
            await modalInteraction.reply({
              content: `Successfully removed items in environment ${editEnvironmentItemsName} to ${editEnvironmentItems
                .map((item: any) => item.itemName)
                .join(", ")}.`,
              ephemeral: true,
            });
            break;

          case "set":
            editEnvironmentItemsData.items = editEnvironmentItems.map(
              (item: any) => item.itemName
            );

            await editEnvironmentItemsData.save();
            await modalInteraction.reply({
              content: `Successfully set items in environment ${editEnvironmentItemsName} to ${editEnvironmentItems
                .map((item: any) => item.itemName)
                .join(", ")}.`,
              ephemeral: true,
            });
            break;
        }
        break;

      case "edit-environment-channel-modal":
        // get input values
        const editEnvironmentChannelName: string = modalInteraction.fields
          .getTextInputValue("edit-environment-name-input")
          .toLowerCase();
        const editEnvironmentChannel = modalInteraction.fields
          .getTextInputValue("edit-environment-channel-input")
          .toLowerCase();

        const editEnvironmentChannelData =
          await modalInteraction.guild.channels.cache.get(
            editEnvironmentChannel
          );
        if (!editEnvironmentChannelData) {
          await modalInteraction.reply({
            content: "Channel not found!",
            ephemeral: true,
          });
          return;
        }

        const editEnvironmentChannelObj = await environmentData.findOne({
          name: editEnvironmentChannelName,
        });

        if (!editEnvironmentChannelObj) {
          await modalInteraction.reply({
            content: "Environment not found!",
            ephemeral: true,
          });
          return;
        }

        editEnvironmentChannelObj.channel = editEnvironmentChannel;
        await editEnvironmentChannelObj.save();
        await modalInteraction.reply({
          content: `Successfully edited environment ${editEnvironmentChannelName} to <#${editEnvironmentChannel}>.`,
          ephemeral: true,
        });

        break;

      case "delete-environment-modal":
        // get input values
        const deleteEnvironmentName: string = modalInteraction.fields
          .getTextInputValue("delete-environment-name-input")
          .toLowerCase();

        const deleteEnvironmentObj: any = await environmentData.findOne({
          name: deleteEnvironmentName,
        });
        if (!deleteEnvironmentObj) {
          await modalInteraction.reply({
            content: "Environment not found!",
            ephemeral: true,
          });
          return;
        }

        const startEnvironmentObj = await environmentData.findOne({
          name: "start",
        });
        deleteEnvironmentObj.environmentUsers.forEach(async (id: string) => {
          const userObj = await UserData.findOne({
            id,
            guild: modalInteraction.guild.id,
          });
          if (!userObj) return;

          userObj.environment = "start";
          startEnvironmentObj.users.push(id);
          await userObj.save();
          await startEnvironmentObj.save();
        });

        await deleteEnvironmentObj.deleteOne();
        await modalInteraction.reply({
          content: `Successfully deleted environment ${deleteEnvironmentName}.`,
          ephemeral: true,
        });
        break;

      case "user-relocator-modal":
        // get input values
        const relocateNameInput = modalInteraction.fields
          .getTextInputValue("environment-name-input")
          .toLowerCase();
        const relocateUserId = modalInteraction.fields
          .getTextInputValue("environment-user-input")
          .toLowerCase()
          .split(",")
          .map((id: string) => id.trim());

        const relocateEnvironmentObj = await environmentData.findOne({
          name: relocateNameInput,
        });

        if (!relocateEnvironmentObj) {
          await modalInteraction.reply({
            content: "Environment not found!",
            ephemeral: true,
          });
          return;
        }
        relocateUserId.forEach(async (relocateUserId: string) => {
          const relocateUserObj = await UserData.findOne({
            id: relocateUserId,
          });

          if (!relocateUserObj) {
            await modalInteraction.reply({
              content: "User not found!",
              ephemeral: true,
            });
            return;
          }
          if (relocateUserObj.environment) {
            const relocateUserPreviousEnvironmentObj =
              await environmentData.findOne({
                name: relocateUserObj.environment,
              });

            if (relocateUserPreviousEnvironmentObj) {
              relocateUserPreviousEnvironmentObj.users =
                relocateUserPreviousEnvironmentObj.users.filter(
                  (user: string) => user !== relocateUserId
                );

              await relocateUserPreviousEnvironmentObj.save();
            }
          }
          relocateUserObj.environment = relocateEnvironmentObj.name;
          relocateEnvironmentObj.users.push(relocateUserId);
          await relocateUserObj.save();
          await relocateEnvironmentObj.save();
        });

        const relocateUserIds = relocateUserId.join(">, <@");
        await modalInteraction.reply({
          content: `Successfully relocated user(s) <@${relocateUserIds}> to environment ${relocateNameInput}.`,
          ephemeral: true,
        });
        break;

      // Bot Perform Modals
      case "send-message-modal":
        // get input values
        let sendMessageChannel = modalInteraction.fields
          .getTextInputValue("send-message-target-channel-input")
          .toLowerCase();
        const sendMessageContent = modalInteraction.fields.getTextInputValue(
          "send-message-content-input"
        );

        // Validate and format the inputs
        if (sendMessageChannel === "here") {
          sendMessageChannel = modalInteraction.channel.id;
        }
        const sendMessageChannelObj =
          modalInteraction.guild.channels.cache.get(sendMessageChannel);

        if (!sendMessageChannelObj) {
          await modalInteraction.reply({
            content: "Channel not found!",
            ephemeral: true,
          });
          return;
        }

        // send message
        await (sendMessageChannelObj as TextChannel).send(sendMessageContent);
        await modalInteraction.reply({
          content: `Sent message in ${sendMessageChannelObj.name}.`,
          ephemeral: true,
        });

        break;

      // Moderation Modals
      case "ban-user-modal":
        // get input values

        const banUserId = modalInteraction.fields.getTextInputValue(
          "ban-user-target-input"
        );
        const banUserReason = modalInteraction.fields.getTextInputValue(
          "ban-user-reason-input"
        );

        // Validate the inputs
        if (banUserId === "") {
          await modalInteraction.reply({
            content: "Please fill in the required fields.",
            ephemeral: true,
          });
          return;
        }

        const buttonConfirm = new ButtonBuilder()
          .setCustomId("ban-user-confirm")
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(false);

        const buttonCancel = new ButtonBuilder()
          .setCustomId("ban-user-cancel")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Success)
          .setDisabled(false);

        await modalInteraction.reply({
          content: "Are you sure you want to ban this user?",
          ephemeral: true,
          components: buttonWrapper([buttonConfirm, buttonCancel]),
        });

        const collector =
          modalInteraction.channel.createMessageComponentCollector({
            filter: (m) => m.user.id === modalInteraction.user.id,
            max: 1,
          });

        collector.on("collect", async (i) => {
          if (i.customId === "ban-user-confirm") {
          }
        });

        break;

      case "kick-user-modal":
        // get input values

        const kickUserId = modalInteraction.fields.getTextInputValue(
          "kick-user-target-input"
        );
        const kickUserReason =
          modalInteraction.fields.getTextInputValue("kick-user-reason-input") ||
          "No reason provided";

        // get the target user object
        const kickUser = await modalInteraction.guild.members.fetch(kickUserId);

        // check if the target user exists, else edit the reply and return
        if (!kickUser) {
          await modalInteraction.reply({
            content: "That user doesn't exist in this server.",
            ephemeral: true,
          });
          return;
        }

        // check if the target user is a bot
        if (kickUser.user.bot) {
          await modalInteraction.reply({
            content: "You cannot kick a bot.",
            ephemeral: true,
          });
          return;
        }

        // check if the target user is the owner of the server
        if (kickUser.id === modalInteraction.guild.ownerId) {
          await modalInteraction.reply({
            content: "I cannot kick my creator.",
            ephemeral: true,
          });
          return;
        }
        // define the target user role position and request user role position
        const kickUserRolePosition = kickUser.roles.highest.position;
        const kickUserRequesterRolePosition = (
          modalInteraction.member.roles as GuildMemberRoleManager
        ).highest.position;
        const kickUserBotRolePosition =
          modalInteraction.guild.members.me.roles.highest.position;

        // check if the target user is of a higher position than the request user
        if (kickUserRolePosition >= kickUserRequesterRolePosition) {
          await modalInteraction.reply({
            content:
              "That user is of a higher position of the power hierarchy than you. Therefore you cannot kick them.",
            ephemeral: true,
          });
          return;
        }

        // check if the target user is of a higher position than the bot
        if (kickUserRolePosition >= kickUserBotRolePosition) {
          await modalInteraction.reply({
            content:
              "That user is of a higher position of the power hierarchy than me. Therefore i cannot kick them.",
            ephemeral: true,
          });
          return;
        }
        // kick the user
        try {
          await kickUser.kick(kickUserReason);
          await modalInteraction.reply({
            content: `The user <@${kickUser.user.id}> has been kicked successfully.\n${kickUserReason}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error("Error kicking user: ", error);
          log({
            header: "Error kicking user",
            payload: `${kickUser.user.id} - ${kickUser.user.tag}\n${error}`,
            type: "error",
          });
        }

        break;

      case "timeout-user-modal":
        // get input values

        const timeoutUserId = modalInteraction.fields.getTextInputValue(
          "timeout-user-target-input"
        );
        let timeoutUserDuration = modalInteraction.fields.getTextInputValue(
          "timeout-user-duration-input"
        );
        const timeoutUserReason =
          modalInteraction.fields.getTextInputValue(
            "timeout-user-reason-input"
          ) || "No reason provided";

        // get the target user object
        const timeoutUser = await modalInteraction.guild.members.fetch(
          timeoutUserId
        );

        // check if the target user exists, else edit the reply and return
        if (!timeoutUser) {
          await modalInteraction.reply({
            content: `That user doesn't exist in this server.\n${timeoutUserReason}`,
            ephemeral: true,
          });
          return;
        }

        // check if the target user is a bot
        if (timeoutUser.user.bot) {
          await modalInteraction.reply({
            content: "You cannot timeout a bot.",
            ephemeral: true,
          });
          return;
        }

        // check if the target user is the owner of the server
        if (timeoutUser.id === modalInteraction.guild.ownerId) {
          await modalInteraction.reply({
            content: "I cannot timeout my creator.",
            ephemeral: true,
          });
          return;
        }

        //get duration in ms
        const timeoutUserDurationMs = ms(timeoutUserDuration);

        //check if duration is valid
        if (isNaN(timeoutUserDurationMs)) {
          await modalInteraction.reply({
            content: "Invalid duration. Please enter a valid duration.",
            ephemeral: true,
          });
          return;
        }

        //check if the duration is below 5 seconds or above 28 days
        if (
          timeoutUserDurationMs < 5000 ||
          timeoutUserDurationMs > 28 * 24 * 60 * 60 * 1000
        ) {
          await modalInteraction.reply({
            content:
              "Invalid duration. Please enter a duration between 5 seconds and 28 days.",
            ephemeral: true,
          });
          return;
        }

        // define role positions
        const timeoutUserRolePosition = timeoutUser.roles.highest.position;
        const timeoutUserRequesterRolePosition = (
          modalInteraction.member.roles as GuildMemberRoleManager
        ).highest.position;
        const timeoutUserBotRolePosition =
          modalInteraction.guild.members.me.roles.highest.position;

        // check if the target user is of a higher position than the request user
        if (timeoutUserRolePosition >= timeoutUserRequesterRolePosition) {
          await modalInteraction.reply({
            content:
              "That user is of a higher position of the power hierarchy than you. Therefore you cannot timeout them.",
            ephemeral: true,
          });
          return;
        }

        // check if the target user is of a higher position than the bot
        if (timeoutUserRolePosition >= timeoutUserBotRolePosition) {
          await modalInteraction.reply({
            content:
              "That user is of a higher position of the power hierarchy than me. Therefore i cannot timeout them.",
            ephemeral: true,
          });
          return;
        }

        // timeout the user
        try {
          await timeoutUser.timeout(timeoutUserDurationMs, timeoutUserReason);
          await modalInteraction.reply({
            content: `The user <@${timeoutUser.user.id}> has been timed out successfully.\n${timeoutUserReason}`,
            ephemeral: true,
          });
        } catch (error) {
          console.error("Error timing out user: ", error);
          log({
            header: "Error timing out user",
            payload: `${timeoutUser.user.id} - ${timeoutUser.user.tag}\n${error}`,
            type: "error",
          });
        }

        break;

      //region Onboarding modals

      case "onboarding-modal":
        const onboardingName = modalInteraction.fields.getTextInputValue(
          "onboarding-modal-name"
        );
        let onboardingUser = await UserData.findOne({
          id: modalInteraction.user.id,
          guild: modalInteraction.guild.id,
        });

        if (!onboardingUser) {
          onboardingUser = new UserData({
            id: modalInteraction.user.id,
            guild: modalInteraction.guild.id,
            name: onboardingName,
          });
        }

        onboardingUser.name = onboardingName;
        await onboardingUser.save();
        const onboardingSpeciesSelection = new StringSelectMenuBuilder()
          .setCustomId("onboarding-species-selection")
          .setPlaceholder("Select your species")
          .addOptions(
            new StringSelectMenuOptionBuilder({
              label: "Human",
              value: "Human",
              emoji: "🧑",
              description: "Humans are the most common and versatile species.",
            }),
            new StringSelectMenuOptionBuilder({
              label: "Elf",
              value: "Elf",
              emoji: "🧝",
              description:
                "Elves are known for their magical abilities and agility.",
            }),
            new StringSelectMenuOptionBuilder({
              label: "Dwarf",
              value: "Dwarf",
              emoji: "🧙",
              description:
                "Dwarves are known for their dexterity and intelligence.",
            }),
            new StringSelectMenuOptionBuilder({
              label: "Orc",
              value: "Orc",
              emoji: "🧛",
              description: "Orcs are known for their resilience and strength.",
            })
          );
        const onboardingSpeciesSelectionRow =
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            onboardingSpeciesSelection
          );

        const reply = await modalInteraction.reply({
          content:
            "The database has been updated, your name has been saved. Please select your species",
          components: [onboardingSpeciesSelectionRow],
          ephemeral: true,
        });

        setTimeout(async () => {
          await reply.delete();
        }, 5 * 60 * 1000);
        break;

      default:
        modalInteraction.reply({
          content: "Something went wrong, Modal not found.",
          ephemeral: true,
        });

        log({
          folder: path.join(__dirname, "..", "..", "..", "logs"),
          header: "Modal not found",
          payload: `${modalInteraction.customId} - ${modalInteraction.user.id} - ${modalInteraction.user.tag}`,
        });
        break;
    }
  } catch (error) {
    console.error("Error processing a modal: ", error);

    await modalInteraction
      .reply({
        content:
          "Something went wrong, the modal could not be processed correctly.",
        ephemeral: true,
      })
      .catch((err) =>
        log({
          header: "Response error",
          payload: `${err}`,
          type: "error",
        })
      );
    log({
      header: "Error processing a modal",
      payload: `${modalInteraction.customId} - ${modalInteraction.user.id} - ${modalInteraction.user.tag}\n${error}`,
      type: "error",
    });
  }
};

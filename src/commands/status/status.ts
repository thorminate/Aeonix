// shows your status
import {
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ActionRowBuilder,
  Client,
  Interaction,
  CommandInteraction,
  GuildMember,
  PermissionsBitField,
  MessageComponentInteraction,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  EmbedBuilder,
  HTTPError,
  InteractionReplyOptions,
} from "discord.js";
import UserData from "../../models/userDatabaseSchema";
import calculateLevelExp from "../../utils/calculateLevelExp";
import buttonWrapper from "../../utils/buttonWrapper";
import commandVerify from "../../utils/commandVerify";
import log from "../../utils/log";

module.exports = {
  name: "status",
  description: "Shows your personal menu",
  //devOnly: Boolean,
  //testOnly: true,
  //permissionsRequired: [PermissionFlagsBits.Administrator],
  //botPermissions: [PermissionFlagsBits.Administrator],
  //options: [],
  //deleted: true,

  callback: async (bot: Client, interaction: CommandInteraction) => {
    try {
      if (!commandVerify(interaction)) return;

      // defer reply and make it ephemeral
      await interaction.deferReply({
        ephemeral: true,
      });

      //define targetUserObj
      const userObj = await interaction.guild.members.fetch(
        interaction.user.id
      );

      // find user in database and then get their data
      const userData = await UserData.findOne({
        id: interaction.user.id,
        guild: interaction.guild.id,
      });

      // if user doesn't exist in database, say so and return
      if (!userData) {
        interaction.editReply(
          "You haven't been integrated into Floura's database yet. Head over to <#1270790941892153404>"
        );
        return;
      }

      let skillsDisplay: string;
      if (userData.skills && userData.skills.length > 0) {
        skillsDisplay = userData.skills
          .map((skill: string) => {
            const skillUppercaseLetter = skill[0].toUpperCase();
            return `${skillUppercaseLetter}${skill.slice(1)}`;
          })
          .join(", ");
      } else {
        skillsDisplay = "No skills learned yet";
      }

      async function playerMenu(prevAdmin = false) {
        if (!interaction.isCommand()) return;
        const playerEmbed = new EmbedBuilder()
          .setTitle(`Status menu`)
          .setDescription(
            `Hello <@${userObj.user.id}>!\nYour level is **${
              userData.level
            }** and you have **${userData.exp}/${calculateLevelExp(
              userData.level + 1
            )}** experience.`
          )
          .addFields(
            {
              name: "***Stats:***",
              value: `**Strength:** ***${userData.strength}***\n**Will:** ***${userData.will}***\n**Cognition:** ***${userData.cognition}***`,
            },
            {
              name: "***Skills:***",
              value: `${skillsDisplay}`,
            }
          );
        const inventory = new ButtonBuilder()
          .setLabel("Inventory")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("inventory")
          .setDisabled(false);

        let playerReply: any;
        if (prevAdmin === true) {
          const backToAdmin = new ButtonBuilder()
            .setLabel("Reload as admin")
            .setStyle(ButtonStyle.Primary)
            .setCustomId("backAsAdmin")
            .setDisabled(false);

          playerReply = await interaction.editReply({
            embeds: [playerEmbed],
            ephemeral: true,
            components: buttonWrapper([inventory, backToAdmin]),
          } as InteractionReplyOptions);
        } else {
          playerReply = await interaction.editReply({
            embeds: [playerEmbed],
            ephemeral: true,
            components: buttonWrapper([inventory]),
          } as InteractionReplyOptions);
        }

        // make sure the user who ran the command is the one who clicked the button
        const filter = (i: CommandInteraction) =>
          i.user.id === interaction.user.id;

        // collect button clicks
        const collector = playerReply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter,
        });

        collector.on("collect", async (i: MessageComponentInteraction) => {
          if (i.replied) return;
          if (i.customId === "inventory") {
            const formattedInventory =
              userData.inventory
                .map((item) => `${item.itemName}`)
                .join(",\n") || "is empty...";
            await i.reply({
              content: `## Your inventory\n ${formattedInventory}`,
              ephemeral: true,
            });
          } else if (i.customId === "backAsAdmin") {
            await adminMenu(true);
          }
        });
      }

      async function adminMenu(prevPlayer = false) {
        if (!interaction.isCommand()) return;

        // set up admin button collection
        const playerModification = new ButtonBuilder()
          .setLabel("Modify Player Data")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("player-modification")
          .setDisabled(false);

        const moderation = new ButtonBuilder()
          .setLabel("Moderation")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("moderation")
          .setDisabled(false);

        const botPerform = new ButtonBuilder()
          .setLabel("Perform Bot Action")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("bot-perform")
          .setDisabled(false);

        const environmentModification = new ButtonBuilder()
          .setLabel("Environment Modification")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("environment-modification")
          .setDisabled(false);

        const playerMode = new ButtonBuilder()
          .setLabel("Reload as Player")
          .setStyle(ButtonStyle.Primary)
          .setCustomId("player-mode")
          .setDisabled(false);

        // send welcome message to admin

        const adminEmbed = new EmbedBuilder()
          .setTitle(`Welcome, ${userObj.user.displayName}!`)
          .setAuthor({
            name: "Administrator Menu",
            iconURL: userObj.user.avatarURL(),
            url: `https://discord.com/users/${userObj.user.id}`,
          })
          .setDescription(
            `Welcome Administrator <@${userObj.user.id}>!\nYour level is **${
              userData.level
            }** and you have **${userData.exp}/${calculateLevelExp(
              userData.level + 1
            )}** experience.\n`
          )
          .addFields(
            {
              name: "Stats",
              value: `**Strength:** ***${userData.strength}***\n**Will:** ***${userData.will}***\n**Cognition:** ***${userData.cognition}***`,
            },
            { name: "Skills", value: skillsDisplay }
          )
          .setFooter({
            text: "What Action Would You Like To Perform?",
            iconURL: bot.user.avatarURL(),
          });

        const adminReply = await interaction.editReply({
          embeds: [adminEmbed],
          components: buttonWrapper([
            playerModification,
            environmentModification,
            moderation,
            botPerform,
            playerMode,
          ]),
        });
        // make sure the user who ran the command is the one who clicked the button
        const filter = (i: Interaction) => i.user.id === interaction.user.id;

        // collect button clicks
        const collector = adminReply.createMessageComponentCollector({
          componentType: ComponentType.Button,
          filter,
        });

        collector.on(
          "collect",
          async (buttonInteraction: MessageComponentInteraction) => {
            switch (buttonInteraction.customId) {
              // Initial Buttons
              case "player-modification":
                // Handle "Modify Player Data" button click
                const updatedComponents = adminReply.components.map(
                  (row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  }
                );

                // Edit the original reply to disable the button
                await interaction.editReply({
                  components: updatedComponents,
                });
                // Define buttons for submenu

                const modifyStatsButton = new ButtonBuilder()
                  .setLabel("Modify Stats")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("modify_stats")
                  .setDisabled(false);

                const modifySkillsButton = new ButtonBuilder()
                  .setLabel("Modify Skills")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("modify_skills")
                  .setDisabled(false);

                const modifyItemsButton = new ButtonBuilder()
                  .setLabel("Modify Items")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("modify_items")
                  .setDisabled(false);

                const modifyStatusEffectsButton = new ButtonBuilder()
                  .setLabel("Modify Status Effects")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("modify_status_effects")
                  .setDisabled(false);

                const modifyEnvironmentButton = new ButtonBuilder()
                  .setLabel("Modify Player Location")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("modify_environment")
                  .setDisabled(false);

                const embed = new EmbedBuilder()
                  .setColor(0x0099ff)
                  .setTitle(
                    `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`
                  );
                if (prevPlayer === true) {
                  await buttonInteraction.editReply({
                    embeds: [embed],
                    components: buttonWrapper([
                      modifyStatsButton,
                      modifySkillsButton,
                      modifyItemsButton,
                      modifyStatusEffectsButton,
                      modifyEnvironmentButton,
                    ]),
                  });
                } else {
                  await buttonInteraction.update({
                    embeds: [embed],
                    components: buttonWrapper([
                      modifyStatsButton,
                      modifySkillsButton,
                      modifyItemsButton,
                      modifyStatusEffectsButton,
                      modifyEnvironmentButton,
                    ]),
                  });
                }

                break;

              case "environment-modification":
                // Handle "Environment Modification" button click
                const envUpdatedComponents = adminReply.components.map(
                  (row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  }
                );

                // Edit the original reply to disable the button
                await interaction.editReply({
                  components: envUpdatedComponents,
                });

                // Define buttons for submenu

                const createEnvironmentButton = new ButtonBuilder()
                  .setLabel("Create Environment")
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId("create_environment")
                  .setDisabled(false);

                const editEnvironmentButton = new ButtonBuilder()
                  .setLabel("Edit Environment")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("edit_environment")
                  .setDisabled(false);

                const deleteEnvironmentButton = new ButtonBuilder()
                  .setLabel("Delete Environment")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("delete_environment")
                  .setDisabled(false);

                const envEmbed = new EmbedBuilder()
                  .setColor(0x0099ff)
                  .setTitle(
                    `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`
                  );
                if (prevPlayer === true) {
                  await buttonInteraction.editReply({
                    embeds: [envEmbed],
                    components: buttonWrapper([
                      createEnvironmentButton,
                      editEnvironmentButton,
                      deleteEnvironmentButton,
                    ]),
                  });
                } else {
                  await buttonInteraction.update({
                    embeds: [envEmbed],
                    components: buttonWrapper([
                      createEnvironmentButton,
                      editEnvironmentButton,
                      deleteEnvironmentButton,
                    ]),
                  });
                }
                break;

              case "moderation":
                // Handle "Moderation" button click
                const moderationUpdatedComponents = adminReply.components.map(
                  (row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  }
                );

                // Edit the original reply to disable the button
                await interaction.editReply({
                  content: `loading...`,
                  components: moderationUpdatedComponents,
                });
                // Define buttons for submenu

                const banUserButton = new ButtonBuilder()
                  .setLabel("Ban User")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("ban_user")
                  .setDisabled(false);

                const kickUserButton = new ButtonBuilder()
                  .setLabel("Kick User")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("kick_user")
                  .setDisabled(false);

                const timeoutUserButton = new ButtonBuilder()
                  .setLabel("Timeout User")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("timeout_user")
                  .setDisabled(false);

                await buttonInteraction.update({
                  content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                    0,
                    1
                  )}?`,
                  components: buttonWrapper([
                    banUserButton,
                    kickUserButton,
                    timeoutUserButton,
                  ]),
                });

                break;

              case "player-mode":
                // Handle "Reload as Player" button click
                await playerMenu(true);
                break;

              case "bot-perform":
                // Handle "Perform Bot Action" button click
                const botPerformUpdatedComponents = adminReply.components.map(
                  (row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  }
                );

                // Edit the original reply to disable the button
                await interaction.editReply({
                  content: `loading...`,
                  components: botPerformUpdatedComponents,
                });

                // Define buttons for submenu
                const botPerformSendMessageButton = new ButtonBuilder()
                  .setLabel("Send Message")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("send_message")
                  .setDisabled(false);

                if (prevPlayer === true) {
                  await buttonInteraction.editReply({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([botPerformSendMessageButton]),
                  });
                } else {
                  await buttonInteraction.update({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([botPerformSendMessageButton]),
                  });
                }
                break;

              // Player Modification Buttons
              case "modify_stats":
                // Handle "Modify Stats" button click
                try {
                  // Set up the Stats Giver modal
                  const statsGiverModal = new ModalBuilder()
                    .setCustomId("stats-giver-modal")
                    .setTitle("Stat Giver");

                  const statsGiverModifierInput = new TextInputBuilder()
                    .setCustomId("stats-giver-modifier-input")
                    .setLabel("Modifier of stats to give")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1);

                  const statsGiverVariantInput = new TextInputBuilder()
                    .setCustomId("stats-giver-variant-input")
                    .setLabel("Variant of stats to give")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1);

                  const statsGiverInput = new TextInputBuilder()
                    .setCustomId("stats-giver-input")
                    .setLabel("Amount of stat points to give, remove or set")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1);

                  const statsGiverTargetInput = new TextInputBuilder()
                    .setCustomId("stats-giver-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const statsGiverRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      statsGiverInput
                    );
                  const statsGiverVariantRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      statsGiverVariantInput
                    );
                  const statsGiverTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      statsGiverTargetInput
                    );
                  const statsGiverModifierRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      statsGiverModifierInput
                    );
                  statsGiverModal.addComponents(
                    statsGiverRow,
                    statsGiverVariantRow,
                    statsGiverTargetRow,
                    statsGiverModifierRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(statsGiverModal);
                } catch (error) {
                  console.log("Error handling Stats Giver modal:", error);
                  log({
                    header: "Error handling Stats Giver modal",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "modify_skills":
                // Handle "Modify Player Data" button click
                const modifySkillsUpdatedComponents = adminReply.components.map(
                  (row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  }
                );

                // Edit the original reply to disable the button
                await interaction.editReply({
                  components: modifySkillsUpdatedComponents,
                });
                // Define buttons for submenu

                const createSkillButton = new ButtonBuilder()
                  .setLabel("Create Skill")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("create_skill")
                  .setDisabled(false);

                const deleteSkillButton = new ButtonBuilder()
                  .setLabel("Delete Skill")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("delete_skill")
                  .setDisabled(false);

                const grantSkillButton = new ButtonBuilder()
                  .setLabel("Grant Skill")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("grant_skill")
                  .setDisabled(false);

                const revokeSkillButton = new ButtonBuilder()
                  .setLabel("Revoke Skill")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("revoke_skill")
                  .setDisabled(false);

                if (prevPlayer === true) {
                  await buttonInteraction.editReply({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([
                      createSkillButton,
                      grantSkillButton,
                      revokeSkillButton,
                      deleteSkillButton,
                    ]),
                  });
                } else {
                  await buttonInteraction.update({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([
                      createSkillButton,
                      grantSkillButton,
                      revokeSkillButton,
                      deleteSkillButton,
                    ]),
                  });
                }

                break;

              case "modify_items":
                // Handle "Modify Items" button click
                const modifyItemsUpdatedComponents = adminReply.components.map(
                  (row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  }
                );

                // Edit the original reply to disable the button
                await interaction.editReply({
                  components: modifyItemsUpdatedComponents,
                });
                // Define buttons for submenu
                const createItemButton = new ButtonBuilder()
                  .setLabel("Create Item")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("create_item")
                  .setDisabled(false);

                const deleteItemButton = new ButtonBuilder()
                  .setLabel("Delete Item")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("delete_item")
                  .setDisabled(false);

                const giveItemButton = new ButtonBuilder()
                  .setLabel("Give Item")
                  .setStyle(ButtonStyle.Primary)
                  .setCustomId("give_item")
                  .setDisabled(false);

                const removeItemButton = new ButtonBuilder()
                  .setLabel("Revoke Item")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("revoke_item")
                  .setDisabled(false);

                if (prevPlayer === true) {
                  await buttonInteraction.editReply({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([
                      createItemButton,
                      giveItemButton,
                      removeItemButton,
                      deleteItemButton,
                    ]),
                  });
                } else {
                  await buttonInteraction.update({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([
                      createItemButton,
                      giveItemButton,
                      removeItemButton,
                      deleteItemButton,
                    ]),
                  });
                }

                break;

              case "modify_status_effects":
                // Handle "Modify Status Effects" button click
                const modifyStatusEffectsUpdatedComponents =
                  adminReply.components.map((row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  });

                // Edit the original reply to disable the button
                await interaction.editReply({
                  components: modifyStatusEffectsUpdatedComponents,
                });
                // Define buttons for submenu
                const createStatusEffectButton = new ButtonBuilder()
                  .setLabel("Create Status Effect")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("create_status_effect")
                  .setDisabled(false);

                const deleteStatusEffectButton = new ButtonBuilder()
                  .setLabel("Delete Status Effect")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("delete_status_effect")
                  .setDisabled(false);

                const grantStatusEffectButton = new ButtonBuilder()
                  .setLabel("Grant Status Effect")
                  .setStyle(ButtonStyle.Secondary)
                  .setCustomId("grant_status_effect")
                  .setDisabled(false);

                const revokeStatusEffectButton = new ButtonBuilder()
                  .setLabel("Revoke Status Effect")
                  .setStyle(ButtonStyle.Danger)
                  .setCustomId("revoke_status_effect")
                  .setDisabled(false);

                if (prevPlayer === true) {
                  await buttonInteraction.editReply({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([
                      createStatusEffectButton,
                      grantStatusEffectButton,
                      revokeStatusEffectButton,
                      deleteStatusEffectButton,
                    ]),
                  });
                } else {
                  await buttonInteraction.update({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper([
                      createStatusEffectButton,
                      grantStatusEffectButton,
                      revokeStatusEffectButton,
                      deleteStatusEffectButton,
                    ]),
                  });
                }

                break;

              case "modify_environment":
                // Handle "Modify Environment" button click
                try {
                  // Set up the Environment Modification modal
                  const environmentModificationModal = new ModalBuilder()
                    .setCustomId("user-relocator-modal")
                    .setTitle("User Relocator");

                  const environmentNameInput = new TextInputBuilder()
                    .setCustomId("environment-name-input")
                    .setLabel("Environment name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder("Kobalt");

                  const environmentUserInput = new TextInputBuilder()
                    .setCustomId("environment-user-input")
                    .setLabel("Environment user")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder("123456789012345678, 123456789012345678")
                    .setMinLength(18);

                  const environmentNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      environmentNameInput
                    );
                  const environmentUserRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      environmentUserInput
                    );

                  environmentModificationModal.addComponents(
                    environmentNameRow,
                    environmentUserRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(
                    environmentModificationModal
                  );
                } catch (error) {
                  console.log(error);
                  log({
                    header: "Environment Modification Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              // Skill Modification Buttons
              case "create_skill":
                // Handle "Create Skill" button click
                try {
                  // Set up the Create Skill modal
                  const createSkillModal = new ModalBuilder()
                    .setCustomId("create-skill-modal")
                    .setTitle("Create Skill");

                  const createSkillNameInput = new TextInputBuilder()
                    .setCustomId("create-skill-name-input")
                    .setLabel("Skill name, no special characters!")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createSkillDescriptionInput = new TextInputBuilder()
                    .setCustomId("create-skill-description-input")
                    .setLabel("Skill description")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                  const createSkillActionInput = new TextInputBuilder()
                    .setCustomId("create-skill-action-input")
                    .setLabel("What Floura says when the skill is used")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                  const createSkillCooldownInput = new TextInputBuilder()
                    .setCustomId("create-skill-cooldown-input")
                    .setLabel("Skill cooldown")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createSkillWillInput = new TextInputBuilder()
                    .setCustomId("create-skill-will-input")
                    .setLabel("Will requirement")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createSkillWillRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createSkillWillInput
                    );
                  const createSkillCooldownRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createSkillCooldownInput
                    );

                  const createSkillActionRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createSkillActionInput
                    );
                  const createSkillDescriptionRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createSkillDescriptionInput
                    );
                  const createSkillNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createSkillNameInput
                    );

                  createSkillModal.addComponents(
                    createSkillNameRow,
                    createSkillDescriptionRow,
                    createSkillActionRow,
                    createSkillCooldownRow,
                    createSkillWillRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(createSkillModal);
                } catch (error) {
                  console.log("Error handling Create Skill modal:", error);
                  log({
                    header: "Create Skill Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "delete_skill":
                try {
                  // Set up the Delete Skill modal
                  const deleteSkillModal = new ModalBuilder()
                    .setCustomId("delete-skill-modal")
                    .setTitle("Delete Skill");

                  const deleteSkillNameInput = new TextInputBuilder()
                    .setCustomId("delete-skill-name-input")
                    .setLabel("Skill name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const deleteSkillNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      deleteSkillNameInput
                    );

                  deleteSkillModal.addComponents(deleteSkillNameRow);

                  // Show the modal
                  await buttonInteraction.showModal(deleteSkillModal);
                } catch (error) {
                  console.log("Error handling Delete Skill modal:", error);
                  log({
                    header: "Delete Skill Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "grant_skill":
                // Handle "Grant Skill" button click
                try {
                  // Set up the Grant Skill modal
                  const grantSkillModal = new ModalBuilder()
                    .setCustomId("grant-skill-modal")
                    .setTitle("Grant Skill");

                  const grantSkillNameInput = new TextInputBuilder()
                    .setCustomId("grant-skill-name-input")
                    .setLabel("Skill name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const grantSkillTargetInput = new TextInputBuilder()
                    .setCustomId("grant-skill-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const grantSkillTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      grantSkillTargetInput
                    );
                  const grantSkillNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      grantSkillNameInput
                    );

                  grantSkillModal.addComponents(
                    grantSkillNameRow,
                    grantSkillTargetRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(grantSkillModal);
                } catch (error) {
                  console.log("Error handling Grant Skill modal:", error);
                  log({
                    header: "Grant Skill Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "revoke_skill":
                // Handle "Revoke Skill" button click
                try {
                  // Set up the Revoke Skill modal
                  const revokeSkillModal = new ModalBuilder()
                    .setCustomId("revoke-skill-modal")
                    .setTitle("Revoke Skill");

                  const revokeSkillTargetInput = new TextInputBuilder()
                    .setCustomId("revoke-skill-target-input")
                    .setLabel("The user who's skill you want to revoke")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const revokeSkillNameInput = new TextInputBuilder()
                    .setCustomId("revoke-skill-name-input")
                    .setLabel("The Name of the skill you want to revoke")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const revokeSkillTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      revokeSkillTargetInput
                    );
                  const revokeSkillNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      revokeSkillNameInput
                    );

                  revokeSkillModal.addComponents(
                    revokeSkillNameRow,
                    revokeSkillTargetRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(revokeSkillModal);
                } catch (error) {
                  console.log("Error handling Revoke Skill modal:", error);
                  log({
                    header: "Revoke Skill Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              // Item Modification Buttons
              case "create_item":
                // Handle "Create Item" button click
                try {
                  // Set up the Create Item modal
                  const createItemModal = new ModalBuilder()
                    .setCustomId("create-item-modal")
                    .setTitle("Create Item");

                  const createItemNameInput = new TextInputBuilder()
                    .setCustomId("create-item-name-input")
                    .setLabel("Item Descriptor/Name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createItemDescriptionInput = new TextInputBuilder()
                    .setCustomId("create-item-description-input")
                    .setLabel("Item Description")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                  const createItemActionableInput = new TextInputBuilder()
                    .setCustomId("create-item-actionable-input")
                    .setLabel("What the item does, use/consume/interact")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createItemActionInput = new TextInputBuilder()
                    .setCustomId("create-item-action-input")
                    .setLabel("What happens when you interact?")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                  const createItemNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createItemNameInput
                    );
                  const createItemDescriptionRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createItemDescriptionInput
                    );
                  const createItemActionableRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createItemActionableInput
                    );
                  const createItemActionRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createItemActionInput
                    );

                  createItemModal.addComponents(
                    createItemNameRow,
                    createItemDescriptionRow,
                    createItemActionableRow,
                    createItemActionRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(createItemModal);
                } catch (error) {
                  console.log("Error handling Create Item modal:", error);
                  log({
                    header: "Create Item Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "give_item":
                // Handle "Give Item" button click
                try {
                  // Set up the Give Item modal
                  const giveItemModal = new ModalBuilder()
                    .setCustomId("give-item-modal")
                    .setTitle("Give Item");

                  const giveItemTargetInput = new TextInputBuilder()
                    .setCustomId("give-item-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const giveItemNameInput = new TextInputBuilder()
                    .setCustomId("give-item-name-input")
                    .setLabel("Item Descriptor/Name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const giveItemAmountInput = new TextInputBuilder()
                    .setCustomId("give-item-amount-input")
                    .setLabel("Amount")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1);

                  const giveItemTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      giveItemTargetInput
                    );
                  const giveItemNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      giveItemNameInput
                    );
                  const giveItemAmountRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      giveItemAmountInput
                    );

                  giveItemModal.addComponents(
                    giveItemNameRow,
                    giveItemTargetRow,
                    giveItemAmountRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(giveItemModal);
                } catch (error) {
                  console.log("Error handling Give Item modal:", error);
                  log({
                    header: "Give Item Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "revoke_item":
                // Handle "Revoke Item" button click
                try {
                  // Set up the Revoke Item modal
                  const revokeItemModal = new ModalBuilder()
                    .setCustomId("revoke-item-modal")
                    .setTitle("Revoke Item");

                  const revokeItemTargetInput = new TextInputBuilder()
                    .setCustomId("revoke-item-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const revokeItemNameInput = new TextInputBuilder()
                    .setCustomId("revoke-item-name-input")
                    .setLabel("Item Descriptor/Name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const removeItemTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      revokeItemTargetInput
                    );
                  const removeItemNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      revokeItemNameInput
                    );

                  revokeItemModal.addComponents(
                    removeItemNameRow,
                    removeItemTargetRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(revokeItemModal);
                } catch (error) {
                  console.log("Error handling Revoke Item modal:", error);
                  log({
                    header: "Revoke Item Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "delete_item":
                // Handle "Delete Item" button click
                try {
                  // Set up the Delete Item modal
                  const deleteItemModal = new ModalBuilder()
                    .setCustomId("delete-item-modal")
                    .setTitle("Delete Item");

                  const deleteItemNameInput = new TextInputBuilder()
                    .setCustomId("delete-item-name-input")
                    .setLabel("Item Descriptor/Name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const deleteItemNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      deleteItemNameInput
                    );

                  deleteItemModal.addComponents(deleteItemNameRow);

                  // Show the modal
                  await buttonInteraction.showModal(deleteItemModal);
                } catch (error) {
                  console.log("Error handling Delete Item modal:", error);
                  log({
                    header: "Delete Item Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              // Status Effect Modification Buttons
              case "create_status_effect":
                // Handle "Create Status Effect" button click
                try {
                  // Set up the Create Status Effect modal
                  const createStatusEffectModal = new ModalBuilder()
                    .setCustomId("create-status-effect-modal")
                    .setTitle("Create Status Effect");

                  const createStatusEffectNameInput = new TextInputBuilder()
                    .setCustomId("create-status-effect-name-input")
                    .setLabel("Status Effect name, no special characters!")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createStatusEffectDescriptionInput =
                    new TextInputBuilder()
                      .setCustomId("create-status-effect-description-input")
                      .setLabel("Status Effect description")
                      .setStyle(TextInputStyle.Paragraph)
                      .setRequired(true);

                  const createStatusEffectActionInput = new TextInputBuilder()
                    .setCustomId("create-status-effect-action-input")
                    .setLabel("What Floura does when applied")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                  const createStatusEffectDurationInput = new TextInputBuilder()
                    .setCustomId("create-status-effect-duration-input")
                    .setLabel("Status Effect duration")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createStatusEffectNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createStatusEffectNameInput
                    );
                  const createStatusEffectDescriptionRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createStatusEffectDescriptionInput
                    );
                  const createStatusEffectActionRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createStatusEffectActionInput
                    );
                  const createStatusEffectDurationRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createStatusEffectDurationInput
                    );

                  createStatusEffectModal.addComponents(
                    createStatusEffectNameRow,
                    createStatusEffectDescriptionRow,
                    createStatusEffectActionRow,
                    createStatusEffectDurationRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(createStatusEffectModal);
                } catch (error) {
                  console.log(
                    "Error handling Create Status Effect modal:",
                    error
                  );
                  log({
                    header: "Create Status Effect Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "delete_status_effect":
                // Handle "Delete Status Effect" button click
                try {
                  // Set up the Delete Status Effect modal
                  const deleteStatusEffectModal = new ModalBuilder()
                    .setCustomId("delete-status-effect-modal")
                    .setTitle("Delete Status Effect");

                  const deleteStatusEffectNameInput = new TextInputBuilder()
                    .setCustomId("delete-status-effect-name-input")
                    .setLabel("Status Effect name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const deleteStatusEffectNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      deleteStatusEffectNameInput
                    );

                  deleteStatusEffectModal.addComponents(
                    deleteStatusEffectNameRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(deleteStatusEffectModal);
                } catch (error) {
                  console.log(
                    "Error handling Delete Status Effect modal:",
                    error
                  );
                  log({
                    header: "Delete Status Effect Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "grant_status_effect":
                // Handle "Grant Status Effect" button click
                try {
                  // Set up the Grant Status Effect modal
                  const grantStatusEffectModal = new ModalBuilder()
                    .setCustomId("grant-status-effect-modal")
                    .setTitle("Grant Status Effect");

                  const grantStatusEffectNameInput = new TextInputBuilder()
                    .setCustomId("grant-status-effect-name-input")
                    .setLabel("Status Effect name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const grantStatusEffectTargetInput = new TextInputBuilder()
                    .setCustomId("grant-status-effect-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const grantStatusEffectNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      grantStatusEffectNameInput
                    );
                  const grantStatusEffectTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      grantStatusEffectTargetInput
                    );

                  grantStatusEffectModal.addComponents(
                    grantStatusEffectNameRow,
                    grantStatusEffectTargetRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(grantStatusEffectModal);
                } catch (error) {
                  console.log(
                    "Error handling Grant Status Effect modal:",
                    error
                  );
                  log({
                    header: "Grant Status Effect Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "revoke_status_effect":
                // Handle "Revoke Status Effect" button click
                try {
                  // Set up the Revoke Status Effect modal
                  const revokeStatusEffectModal = new ModalBuilder()
                    .setCustomId("revoke-status-effect-modal")
                    .setTitle("Revoke Status Effect");

                  const revokeStatusEffectNameInput = new TextInputBuilder()
                    .setCustomId("revoke-status-effect-name-input")
                    .setLabel("Status Effect name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const revokeStatusEffectTargetInput = new TextInputBuilder()
                    .setCustomId("revoke-status-effect-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const revokeStatusEffectNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      revokeStatusEffectNameInput
                    );
                  const revokeStatusEffectTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      revokeStatusEffectTargetInput
                    );

                  revokeStatusEffectModal.addComponents(
                    revokeStatusEffectNameRow,
                    revokeStatusEffectTargetRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(revokeStatusEffectModal);
                } catch (error) {
                  console.log(
                    "Error handling Revoke Status Effect modal:",
                    error
                  );
                  log({
                    header: "Revoke Status Effect Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              // Environment Buttons
              case "create_environment":
                // Handle "Create Environment" button click
                try {
                  // Set up the Create Environment modal
                  const createEnvironmentModal = new ModalBuilder()
                    .setCustomId("create-environment-modal")
                    .setTitle("Create Environment");

                  const createEnvironmentNameInput = new TextInputBuilder()
                    .setCustomId("create-environment-name-input")
                    .setLabel("Environment name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createEnvironmentItemsInput = new TextInputBuilder()
                    .setCustomId("create-environment-items-input")
                    .setLabel("Environment items, comma-separated")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const createEnvironmentChannelInput = new TextInputBuilder()
                    .setCustomId("create-environment-channel-input")
                    .setLabel("Environment channel ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const createEnvironmentNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createEnvironmentNameInput
                    );
                  const createEnvironmentItemsRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createEnvironmentItemsInput
                    );

                  const createEnvironmentChannelRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      createEnvironmentChannelInput
                    );

                  createEnvironmentModal.addComponents(
                    createEnvironmentNameRow,
                    createEnvironmentItemsRow,
                    createEnvironmentChannelRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(createEnvironmentModal);
                } catch (error) {
                  console.log(
                    "Error handling Create Environment modal:",
                    error
                  );
                  log({
                    header: "Create Environment Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "edit_environment":
                // Create the Edit Environment submenu
                const editEnvironmentUpdatedComponents =
                  adminReply.components.map((row: any) => {
                    return ActionRowBuilder.from<ButtonBuilder>(
                      row
                    ).setComponents(
                      row.components.map((button: any) => {
                        return button;
                      })
                    );
                  });

                await interaction.editReply({
                  components: editEnvironmentUpdatedComponents,
                });

                // create buttons for submenu

                const editEnvironmentButtons = [
                  new ButtonBuilder()
                    .setCustomId("edit-environment-name")
                    .setLabel("Edit Environment Name")
                    .setStyle(ButtonStyle.Primary),
                  new ButtonBuilder()
                    .setCustomId("edit-environment-items")
                    .setLabel("Edit Environment Items")
                    .setStyle(ButtonStyle.Primary),
                  new ButtonBuilder()
                    .setCustomId("edit-environment-channel")
                    .setLabel("Edit Environment Channel")
                    .setStyle(ButtonStyle.Primary),
                ];

                if (prevPlayer === true) {
                  await buttonInteraction.editReply({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper(editEnvironmentButtons),
                  });
                } else {
                  await buttonInteraction.update({
                    content: `What would you like to do, Administrator ${userObj.user.globalName.substr(
                      0,
                      1
                    )}?`,
                    components: buttonWrapper(editEnvironmentButtons),
                  });
                }
                break;

              case "delete_environment":
                // Handle "Delete Environment" button click
                try {
                  // Set up the Delete Environment modal
                  const deleteEnvironmentModal = new ModalBuilder()
                    .setCustomId("delete-environment-modal")
                    .setTitle("Delete Environment");

                  const deleteEnvironmentNameInput = new TextInputBuilder()
                    .setCustomId("delete-environment-name-input")
                    .setLabel("Environment name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const deleteEnvironmentNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      deleteEnvironmentNameInput
                    );

                  deleteEnvironmentModal.addComponents(
                    deleteEnvironmentNameRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(deleteEnvironmentModal);
                } catch (error) {
                  console.log(
                    "Error handling Delete Environment modal:",
                    error
                  );
                  log({
                    header: "Delete Environment Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              // Edit Environment Buttons
              case "edit-environment-name":
                try {
                  // Set up the Edit Environment Name modal
                  const editEnvironmentNameModal = new ModalBuilder()
                    .setCustomId("edit-environment-name-modal")
                    .setTitle("Edit Environment Name");

                  const editEnvironmentNameInput = new TextInputBuilder()
                    .setCustomId("edit-environment-name-input")
                    .setLabel("Environment name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const editEnvironmentNewNameInput = new TextInputBuilder()
                    .setCustomId("edit-environment-new-name-input")
                    .setLabel("New environment name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const editEnvironmentNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      editEnvironmentNameInput
                    );
                  const editEnvironmentNewNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      editEnvironmentNewNameInput
                    );

                  editEnvironmentNameModal.addComponents(
                    editEnvironmentNameRow,
                    editEnvironmentNewNameRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(editEnvironmentNameModal);
                } catch (error) {
                  console.log(
                    "Error handling Edit Environment Name modal:",
                    error
                  );
                  log({
                    header: "Edit Environment Name Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "edit-environment-items":
                try {
                  // Set up the Edit Environment Items modal
                  const editEnvironmentItemsModal = new ModalBuilder()
                    .setCustomId("edit-environment-items-modal")
                    .setTitle("Edit Environment Items");

                  const editEnvironmentItemsNameInput = new TextInputBuilder()
                    .setCustomId("edit-environment-name-input")
                    .setLabel("Environment name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const editEnvironmentNameOperatorInput =
                    new TextInputBuilder()
                      .setCustomId("edit-environment-items-operator-input")
                      .setLabel("Add, set, or remove")
                      .setStyle(TextInputStyle.Short)
                      .setRequired(true);

                  const editEnvironmentItemsInput = new TextInputBuilder()
                    .setCustomId("edit-environment-items-input")
                    .setLabel("Environment items")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const editEnvironmentItemsNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      editEnvironmentItemsNameInput
                    );
                  const editEnvironmentItemsOperationRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      editEnvironmentNameOperatorInput
                    );
                  const editEnvironmentItemsRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      editEnvironmentItemsInput
                    );

                  editEnvironmentItemsModal.addComponents(
                    editEnvironmentItemsNameRow,
                    editEnvironmentItemsOperationRow,
                    editEnvironmentItemsRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(editEnvironmentItemsModal);
                } catch (error) {
                  console.log(
                    "Error handling Edit Environment Items modal:",
                    error
                  );
                  log({
                    header: "Edit Environment Items Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "edit-environment-channel":
                try {
                  const editEnvironmentChannelModal = new ModalBuilder()
                    .setCustomId("edit-environment-channel-modal")
                    .setTitle("Edit Environment Channel");

                  const editEnvironmentNameInput = new TextInputBuilder()
                    .setCustomId("edit-environment-name-input")
                    .setLabel("Environment name")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const editEnvironmentChannelInput = new TextInputBuilder()
                    .setCustomId("edit-environment-channel-input")
                    .setLabel("Environment channel")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const editEnvironmentNameRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      editEnvironmentNameInput
                    );
                  const editEnvironmentChannelRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      editEnvironmentChannelInput
                    );

                  editEnvironmentChannelModal.addComponents(
                    editEnvironmentNameRow,
                    editEnvironmentChannelRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(
                    editEnvironmentChannelModal
                  );
                } catch (error) {
                  console.log(
                    "Error handling Edit Environment Channel modal:",
                    error
                  );
                  log({
                    header: "Edit Environment Channel Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              // Bot Perform Buttons
              case "send_message":
                // Handle "Send Message" button click
                try {
                  // Set up the Send Message modal
                  const sendMessageModal = new ModalBuilder()
                    .setCustomId("send-message-modal")
                    .setTitle("Send Message");

                  const sendMessageTargetChannelInput = new TextInputBuilder()
                    .setCustomId("send-message-target-channel-input")
                    .setLabel("Target channel ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const sendMessageContentInput = new TextInputBuilder()
                    .setCustomId("send-message-content-input")
                    .setLabel("Message content")
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                  const sendMessageTargetChannelRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      sendMessageTargetChannelInput
                    );
                  const sendMessageContentRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      sendMessageContentInput
                    );

                  sendMessageModal.addComponents(
                    sendMessageTargetChannelRow,
                    sendMessageContentRow
                  );

                  // Show the modal
                  await buttonInteraction.showModal(sendMessageModal);
                } catch (error) {
                  console.log("Error handling Send Message modal:", error);
                  log({
                    header: "Send Message Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }

                break;

              // Moderation Buttons
              case "ban_user":
                // Handle "Ban User" button click
                try {
                  // Set up the Ban User modal
                  const banUserModal = new ModalBuilder()
                    .setCustomId("ban-user-modal")
                    .setTitle("Ban User, very dangerous!");

                  const banUserTargetInput = new TextInputBuilder()
                    .setCustomId("ban-user-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const banUserReasonInput = new TextInputBuilder()
                    .setCustomId("ban-user-reason-input")
                    .setLabel("Reason for ban")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                  const banUserTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      banUserTargetInput
                    );

                  const banUserReasonRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      banUserReasonInput
                    );

                  banUserModal.addComponents(
                    banUserTargetRow,
                    banUserReasonRow
                  );

                  await buttonInteraction.showModal(banUserModal);
                } catch (error) {
                  console.log("Error handling Ban User modal:", error);
                  log({
                    header: "Ban User Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "kick_user":
                // Handle "Kick User" button click
                try {
                  // Set up the Kick User modal
                  const kickUserModal = new ModalBuilder()
                    .setCustomId("kick-user-modal")
                    .setTitle("Kick User, scary!");

                  const kickUserTargetInput = new TextInputBuilder()
                    .setCustomId("kick-user-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const kickUserReasonInput = new TextInputBuilder()
                    .setCustomId("kick-user-reason-input")
                    .setLabel("Reason for kick")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                  const kickUserTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      kickUserTargetInput
                    );

                  const kickUserReasonRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      kickUserReasonInput
                    );

                  kickUserModal.addComponents(
                    kickUserTargetRow,
                    kickUserReasonRow
                  );

                  await buttonInteraction.showModal(kickUserModal);
                } catch (error) {
                  console.log("Error handling Kick User modal:", error);
                  log({
                    header: "Kick User Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;

              case "timeout_user":
                // Handle "Timeout User" button click
                try {
                  // Set up the Timeout User modal
                  const timeoutUserModal = new ModalBuilder()
                    .setCustomId("timeout-user-modal")
                    .setTitle("Timeout User, fun!");

                  const timeoutUserTargetInput = new TextInputBuilder()
                    .setCustomId("timeout-user-target-input")
                    .setLabel("Target user ID")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(18);

                  const timeoutUserDurationInput = new TextInputBuilder()
                    .setCustomId("timeout-user-duration-input")
                    .setLabel("Duration")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                  const timeoutUserReasonInput = new TextInputBuilder()
                    .setCustomId("timeout-user-reason-input")
                    .setLabel("Reason for timeout")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false);

                  const timeoutUserTargetRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      timeoutUserTargetInput
                    );

                  const timeoutUserDurationRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      timeoutUserDurationInput
                    );

                  const timeoutUserReasonRow =
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                      timeoutUserReasonInput
                    );

                  timeoutUserModal.addComponents(
                    timeoutUserTargetRow,
                    timeoutUserDurationRow,
                    timeoutUserReasonRow
                  );

                  await buttonInteraction.showModal(timeoutUserModal);
                } catch (error) {
                  console.log("Error handling Timeout User modal:", error);
                  log({
                    header: "Timeout User Error",
                    payload: `${error}`,
                    type: "error",
                  });
                }
                break;
            }
          }
        );
      }
      if (!(interaction.member.permissions instanceof PermissionsBitField))
        return;
      if (
        interaction.member.permissions.has(PermissionFlagsBits.Administrator)
      ) {
        adminMenu();
      } else {
        playerMenu();
      }
    } catch (error) {
      if (error instanceof HTTPError && error.status === 503) {
        console.log(
          `There was an error running status: The API did not respond in time. ${error.status}`
        );
        log({
          header: "Status Error",
          payload: `The API did not respond in time. ${error.status}\n${error}`,
          type: "error",
        });
      }
      console.log(`There was an error running status: ${error}`);
      log({
        header: "Status Error",
        payload: `${error}`,
        type: "error",
      });
    }
  },
};

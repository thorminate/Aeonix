"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Handles the modals.
 * @param {Client} bot The instantiating client.
 * @param {Interaction} modalInteraction The interaction that ran the command.
 */
const discord_js_1 = require("discord.js");
const buttonWrapper_1 = __importDefault(require("../../utils/buttonWrapper"));
const userDatabaseSchema_1 = __importDefault(require("../../models/userDatabaseSchema"));
const skillDatabaseSchema_1 = __importDefault(require("../../models/skillDatabaseSchema"));
const itemDatabaseSchema_1 = __importDefault(require("../../models/itemDatabaseSchema"));
const statusEffectDatabaseSchema_1 = __importDefault(require("../../models/statusEffectDatabaseSchema"));
const environmentDatabaseSchema_1 = __importDefault(require("../../models/environmentDatabaseSchema"));
const ms_1 = __importDefault(require("ms"));
class EditEnvironmentSharedState {
    name;
    constructor() {
        this.name = "";
    }
}
module.exports = async (bot, modalInteraction) => {
    // Export the function
    if (!modalInteraction.isModalSubmit())
        return;
    try {
        switch (modalInteraction.customId // Switch on the (pretty self-explanatory) custom IDs
        ) {
            // Stat Modal
            case "stats-giver-modal":
                // get input values
                const statAmount = parseInt(modalInteraction.fields.getTextInputValue("stats-giver-input"));
                const statsTargetUserInput = modalInteraction.fields.getTextInputValue("stats-giver-target-input");
                const variant = modalInteraction.fields.getTextInputValue("stats-giver-variant-input");
                const modifier = modalInteraction.fields.getTextInputValue("stats-giver-modifier-input");
                // Validate the inputs
                if (isNaN(statAmount) ||
                    statAmount < 0 ||
                    !modalInteraction.guild.members.cache.has(statsTargetUserInput)) {
                    await modalInteraction.reply({
                        content: "Please enter a valid positive number for the stat amount and a valid user ID.",
                        ephemeral: true,
                    });
                    return;
                }
                if (variant !== "strength" &&
                    variant !== "will" &&
                    variant !== "cognition" &&
                    variant !== "level" &&
                    variant !== "exp") {
                    await modalInteraction.reply({
                        content: "Please enter a valid variant. Valid variants are 'strength', 'will', 'cognition', 'level', and 'exp'.",
                        ephemeral: true,
                    });
                    return;
                }
                if (modifier !== "add" && modifier !== "remove" && modifier !== "set") {
                    await modalInteraction.reply({
                        content: "Please enter a valid modifier. Valid modifiers are 'add', 'remove', and 'set'.",
                        ephemeral: true,
                    });
                    return;
                }
                // Fetch the target user and update their stats
                const statsTargetUserObj = await modalInteraction.guild.members.fetch(statsTargetUserInput);
                const statsTargetUserData = await userDatabaseSchema_1.default.findOne({
                    userId: statsTargetUserObj.user.id,
                    guildId: modalInteraction.guild.id,
                });
                if (!statsTargetUserData) {
                    await modalInteraction.reply({
                        content: "User not found in the database. Please make sure the user has at least sent one message before running this command.",
                        ephemeral: true,
                    });
                    return;
                }
                if (modifier === "add") {
                    if (variant === "strength") {
                        statsTargetUserData.strength =
                            statsTargetUserData.strength + statAmount;
                    }
                    else if (variant === "will") {
                        statsTargetUserData.will = statsTargetUserData.will + statAmount;
                    }
                    else if (variant === "cognition") {
                        statsTargetUserData.cognition =
                            statsTargetUserData.cognition + statAmount;
                    }
                    else if (variant === "level") {
                        statsTargetUserData.level = statsTargetUserData.level + statAmount;
                    }
                    else if (variant === "exp") {
                        statsTargetUserData.exp = statsTargetUserData.exp + statAmount;
                    }
                    await statsTargetUserData.save();
                    await modalInteraction.reply({
                        content: `Successfully gave <@${statsTargetUserObj.user.id}> **${statAmount}** stat point(s) to the ${variant} variant!`,
                        ephemeral: true,
                    });
                }
                if (modifier === "remove") {
                    if (variant === "strength") {
                        statsTargetUserData.strength =
                            statsTargetUserData.strength - statAmount;
                    }
                    else if (variant === "will") {
                        statsTargetUserData.will = statsTargetUserData.will - statAmount;
                    }
                    else if (variant === "cognition") {
                        statsTargetUserData.cognition =
                            statsTargetUserData.cognition - statAmount;
                    }
                    else if (variant === "level") {
                        statsTargetUserData.level = statsTargetUserData.level - statAmount;
                    }
                    else if (variant === "exp") {
                        statsTargetUserData.exp = statsTargetUserData.exp - statAmount;
                    }
                    if (statsTargetUserData.strength < 0) {
                        statsTargetUserData.strength = 0;
                    }
                    if (statsTargetUserData.will < 0) {
                        statsTargetUserData.will = 0;
                    }
                    if (statsTargetUserData.cognition < 0) {
                        statsTargetUserData.cognition = 0;
                    }
                    await statsTargetUserData.save();
                    await modalInteraction.reply({
                        content: `Successfully took <@${statsTargetUserObj.user.id}> **${statAmount}** stat point(s) from ${variant}!`,
                        ephemeral: true,
                    });
                }
                if (modifier === "set") {
                    if (variant === "strength") {
                        statsTargetUserData.strength = statAmount;
                    }
                    else if (variant === "will") {
                        statsTargetUserData.will = statAmount;
                    }
                    else if (variant === "cognition") {
                        statsTargetUserData.cognition = statAmount;
                    }
                    else if (variant === "level") {
                        statsTargetUserData.level = statAmount;
                    }
                    else if (variant === "exp") {
                        statsTargetUserData.exp = statAmount;
                    }
                    await statsTargetUserData.save();
                    await modalInteraction.reply({
                        content: `Successfully set <@${statsTargetUserObj.user.id}>'s ${variant} to **${statAmount}!**`,
                        ephemeral: true,
                    });
                }
                break;
            // Skill Modals
            case "create-skill-modal":
                // get input values
                const createSkillName = modalInteraction.fields
                    .getTextInputValue("create-skill-name-input")
                    .toLowerCase();
                const createSkillDescription = modalInteraction.fields.getTextInputValue("create-skill-description-input");
                const createSkillAction = modalInteraction.fields.getTextInputValue("create-skill-action-input");
                const createSkillCooldown = parseInt(modalInteraction.fields.getTextInputValue("create-skill-cooldown-input"));
                const createSkillWill = parseInt(modalInteraction.fields.getTextInputValue("create-skill-will-input"));
                // Validate the inputs
                if (createSkillName === "" ||
                    createSkillDescription === "" ||
                    createSkillAction === "" ||
                    isNaN(createSkillCooldown) ||
                    isNaN(createSkillWill)) {
                    await modalInteraction.reply({
                        content: "Please fill in all the required fields correctly. Cooldown and Will must be numbers.",
                        ephemeral: true,
                    });
                    return;
                }
                // check if skill already exists
                if (await skillDatabaseSchema_1.default.findOne({ skillName: createSkillName })) {
                    await modalInteraction.reply({
                        content: "Skill already exists. Please choose a different name.",
                        ephemeral: true,
                    });
                    return;
                }
                // create a new skill and store it in the database
                const newSkill = new skillDatabaseSchema_1.default({
                    skillName: createSkillName,
                    skillDescription: createSkillDescription,
                    skillAction: createSkillAction,
                    skillCooldown: createSkillCooldown,
                    skillWill: createSkillWill,
                });
                await newSkill.save();
                await modalInteraction.reply({
                    content: `Successfully created skill ${createSkillName}.`,
                    ephemeral: true,
                });
                break;
            case "delete-skill-modal":
                // get input values
                const deleteSkillName = modalInteraction.fields
                    .getTextInputValue("delete-skill-name-input")
                    .toLowerCase();
                // Validate the inputs
                if (deleteSkillName === "") {
                    await modalInteraction.reply({
                        content: "Please fill in the required field.",
                        ephemeral: true,
                    });
                    return;
                }
                // first delete the skill from all users that have it
                const skillUsers = await userDatabaseSchema_1.default.find({
                    skills: { $elemMatch: { skillName: deleteSkillName } },
                });
                for (const skillUser of skillUsers) {
                    skillUser.skills = skillUser.skills.filter((skill) => skill.skillName !== deleteSkillName);
                    if (skillUser.skills.length === 0) {
                        skillUser.skills = [];
                    }
                    await skillUser.save();
                }
                // delete the skill from the database
                const deletedSkill = await skillDatabaseSchema_1.default.deleteOne({
                    skillName: deleteSkillName,
                });
                if (deletedSkill.deletedCount === 0) {
                    await modalInteraction.reply({
                        content: `Failed to delete skill ${deleteSkillName}. Please check if the skill exists.`,
                        ephemeral: true,
                    });
                }
                else {
                    await modalInteraction.reply({
                        content: `Successfully deleted skill ${deleteSkillName}.`,
                        ephemeral: true,
                    });
                }
                break;
            case "grant-skill-modal":
                // get input values
                const grantSkillName = modalInteraction.fields
                    .getTextInputValue("grant-skill-name-input")
                    .toLowerCase();
                const grantSkillTarget = modalInteraction.fields.getTextInputValue("grant-skill-target-input");
                // Validate the inputs
                if (grantSkillName === "") {
                    await modalInteraction.reply({
                        content: "Please fill in the required fields.",
                        ephemeral: true,
                    });
                    return;
                }
                // grant the skill to the target user
                const grantSkillTargetUserData = await userDatabaseSchema_1.default.findOne({
                    userId: grantSkillTarget,
                });
                if (!grantSkillTargetUserData) {
                    await modalInteraction.reply({
                        content: "Target user not found. Make sure you entered a valid user ID.",
                        ephemeral: true,
                    });
                    return;
                }
                const grantSkillSkill = await skillDatabaseSchema_1.default.findOne({
                    skillName: grantSkillName,
                });
                if (!grantSkillSkill) {
                    await modalInteraction.reply({
                        content: `Skill ${grantSkillName} not found. Make sure you entered a valid skill name. Or create a new skill.`,
                        ephemeral: true,
                    });
                    return;
                }
                // check if the user already has the skill
                if (grantSkillTargetUserData.skills.some((skill) => skill === grantSkillName)) {
                    await modalInteraction.reply({
                        content: `User already has skill ${grantSkillName}.`,
                        ephemeral: true,
                    });
                    return;
                }
                grantSkillSkill.skillUsers.push(grantSkillTargetUserData.userId);
                await grantSkillSkill.save();
                grantSkillTargetUserData.skills.push(grantSkillSkill.skillName);
                await grantSkillTargetUserData.save();
                await modalInteraction.reply({
                    content: `Successfully granted skill ${grantSkillName} to <@${grantSkillTarget}>.`,
                    ephemeral: true,
                });
                break;
            case "revoke-skill-modal":
                // get input values
                const revokeSkillName = modalInteraction.fields
                    .getTextInputValue("revoke-skill-name-input")
                    .toLowerCase();
                const revokeSkillTarget = modalInteraction.fields.getTextInputValue("revoke-skill-target-input");
                // Validate the inputs
                const revokeSkillData = await skillDatabaseSchema_1.default.findOne({
                    skillName: revokeSkillName,
                });
                if (!revokeSkillData) {
                    await modalInteraction.reply({
                        content: `Skill ${revokeSkillName} not found. Make sure you entered a valid skill name. Or create a new skill.`,
                        ephemeral: true,
                    });
                    return;
                }
                const revokeSkillTargetData = await userDatabaseSchema_1.default.findOne({
                    userId: revokeSkillTarget,
                    guildId: modalInteraction.guild.id,
                });
                if (!revokeSkillTargetData) {
                    await modalInteraction.reply({
                        content: "Target user not found. Make sure you entered a valid user ID.",
                        ephemeral: true,
                    });
                    return;
                }
                // check if the user has the skill
                if (revokeSkillTargetData.skills.includes(revokeSkillName)) {
                    revokeSkillTargetData.skills = revokeSkillTargetData.skills.filter((skill) => skill !== revokeSkillName);
                    await revokeSkillTargetData.save();
                    await modalInteraction.reply({
                        content: `Successfully revoked skill ${revokeSkillName} from <@${revokeSkillTarget}>.`,
                        ephemeral: true,
                    });
                }
                else {
                    await modalInteraction.reply({
                        content: `User does not have skill ${revokeSkillName}.`,
                        ephemeral: true,
                    });
                }
                break;
            // Item Modals
            case "create-item-modal":
                // get input values
                const itemName = modalInteraction.fields
                    .getTextInputValue("create-item-name-input")
                    .toLowerCase();
                const itemDescription = modalInteraction.fields.getTextInputValue("create-item-description-input");
                const itemActionable = modalInteraction.fields
                    .getTextInputValue("create-item-actionable-input")
                    .toLowerCase();
                const itemAction = modalInteraction.fields.getTextInputValue("create-item-action-input");
                function checkItemActionSyntax(actionString) {
                    if (actionString === "none")
                        return true;
                    const actionParts = actionString.split(",");
                    const validOperators = ["+", "-"];
                    const validStats = ["STRENGTH", "WILL", "COGNITION"];
                    for (const action of actionParts) {
                        const [stat, operator, value] = action.trim().split(" ");
                        if (!validStats.includes(stat)) {
                            return false; // invalid stat
                        }
                        if (!validOperators.includes(operator)) {
                            return false; // invalid operator
                        }
                        if (isNaN(parseInt(value))) {
                            return false; // invalid value
                        }
                    }
                    return true; // syntax is correct
                }
                /*
              
              // the code to execute the item action using correct syntax
        
              function executeItemAction(actionString, userData) {
                if (actionString === "none") return;
                const actionParts = actionString.split(",");
                const operators = {
                  "+": (a, b) => a + b,
                  "-": (a, b) => a - b,
                };
        
                for (const action of actionParts) {
                  const [stat, operator, value] = action.trim().split(" ");
                  const statName = stat.toLowerCase();
                  const statValue = parseInt(value);
                  userData[statName] = operators[operator](
                    userData[statName],
                    statValue
                  );
                }
              }
              */
                // Validate the inputs
                if (itemActionable !== "interact" &&
                    itemActionable !== "consume" &&
                    itemActionable !== "use") {
                    modalInteraction.reply({
                        content: "The third field must be either 'interact', 'consume' or 'use'.",
                        ephemeral: true,
                    });
                    return;
                }
                if (checkItemActionSyntax(itemAction) === false) {
                    modalInteraction.reply({
                        content: "The fourth field must be a valid action syntax or 'none'.\nExample: COGNITION + 10, WILL - 5\nThey must be separated by a comma and a space. The operator must be either '+' or '-'. The stat must be either 'STRENGTH', 'WILL' or 'COGNITION'. The value must be a number. Each action must be separated by a space. so COGNITION+10, WILL-5 in invalid syntax.",
                        ephemeral: true,
                    });
                    return;
                }
                const existingItem = await itemDatabaseSchema_1.default.findOne({
                    itemName: itemName,
                });
                if (existingItem) {
                    modalInteraction.reply({
                        content: "An item with that name already exists. You can skip this step.",
                        ephemeral: true,
                    });
                    return;
                }
                const newItem = new itemDatabaseSchema_1.default({
                    itemName: itemName,
                    itemDescription: itemDescription,
                    itemActionable: itemActionable,
                    itemAction: itemAction,
                });
                await newItem.save();
                await modalInteraction.reply({
                    content: `Successfully created item ${itemName}.`,
                    ephemeral: true,
                });
                break;
            case "give-item-modal":
                // get input values
                const giveItemName = modalInteraction.fields
                    .getTextInputValue("give-item-name-input")
                    .toLowerCase();
                const giveItemTarget = modalInteraction.fields.getTextInputValue("give-item-target-input");
                const giveItemAmount = parseInt(modalInteraction.fields.getTextInputValue("give-item-amount-input"));
                if (isNaN(giveItemAmount)) {
                    await modalInteraction.reply({
                        content: "Amount must be a number.",
                        ephemeral: true,
                    });
                    return;
                }
                const giveItemTargetData = await userDatabaseSchema_1.default.findOne({
                    userId: giveItemTarget,
                    guildId: modalInteraction.guild.id,
                });
                if (!giveItemTargetData) {
                    await modalInteraction.reply({
                        content: "User not found, make sure they exist in the database.",
                        ephemeral: true,
                    });
                }
                const giveItemData = await itemDatabaseSchema_1.default.findOne({
                    itemName: giveItemName,
                });
                if (!giveItemData) {
                    await modalInteraction.reply({
                        content: "Item not found, make sure it exist in the database",
                        ephemeral: true,
                    });
                }
                const giveItemIndex = giveItemTargetData.inventory.findIndex((item) => item.itemName === giveItemData.itemName);
                if (giveItemIndex === -1) {
                    const inventoryObject = {
                        itemName: giveItemData.itemName,
                        itemAmount: giveItemAmount,
                    };
                    giveItemTargetData.inventory.push(inventoryObject);
                    await giveItemTargetData.save();
                }
                else {
                    giveItemTargetData.inventory[giveItemIndex].itemAmount +=
                        giveItemAmount;
                    await giveItemTargetData.save();
                }
                giveItemData.itemUsers.push(giveItemTarget);
                await giveItemData.save();
                await modalInteraction.reply({
                    content: `Successfully gave ${giveItemAmount}x ${giveItemName} to <@${giveItemTarget}>.`,
                    ephemeral: true,
                });
                break;
            case "remove-item-modal":
                // get input values
                const removeItemName = modalInteraction.fields
                    .getTextInputValue("remove-item-name-input")
                    .toLowerCase();
                const removeItemTarget = modalInteraction.fields.getTextInputValue("remove-item-target-input");
                // Validate the inputs
                const removeItemData = await itemDatabaseSchema_1.default.findOne({
                    itemName: removeItemName,
                });
                if (!removeItemData) {
                    await modalInteraction.reply({
                        content: "Item not found, make sure it exist in the database",
                        ephemeral: true,
                    });
                    return;
                }
                const removeItemTargetData = await userDatabaseSchema_1.default.findOne({
                    userId: removeItemTarget,
                    guildId: modalInteraction.guild.id,
                });
                if (!removeItemTargetData) {
                    await modalInteraction.reply({
                        content: "User not found, make sure they are in the server.",
                        ephemeral: true,
                    });
                    return;
                }
                const removeItemIndex = removeItemTargetData.inventory.findIndex((item) => item.itemName === removeItemData.itemName);
                if (removeItemIndex > -1) {
                    removeItemTargetData.inventory.splice(removeItemIndex, 1);
                    await removeItemTargetData.save();
                    await modalInteraction.reply({
                        content: `Successfully removed item ${removeItemName} from <@${removeItemTarget}>'s inventory.`,
                        ephemeral: true,
                    });
                }
                else {
                    await modalInteraction.reply({
                        content: "User does not have the item in their inventory.",
                        ephemeral: true,
                    });
                    return;
                }
                break;
            case "delete-item-modal":
                // get input values
                const deleteItemName = modalInteraction.fields
                    .getTextInputValue("delete-item-name-input")
                    .toLowerCase();
                // Validate the inputs
                const deleteItemData = await itemDatabaseSchema_1.default.findOne({
                    itemName: deleteItemName,
                });
                if (!deleteItemData) {
                    await modalInteraction.reply({
                        content: "Item not found, make sure it exist in the database",
                        ephemeral: true,
                    });
                    return;
                }
                // Delete the item from people's inventories
                const deleteItemUsers = deleteItemData.itemUsers;
                for (const user of deleteItemUsers) {
                    const deleteItemUserData = await userDatabaseSchema_1.default.findOne({
                        userId: user,
                        guildId: modalInteraction.guild.id,
                    });
                    const deleteItemIndex = deleteItemUserData.inventory.findIndex((item) => item.itemName === deleteItemName);
                    if (deleteItemIndex > -1) {
                        deleteItemUserData.inventory.splice(deleteItemIndex, 1);
                        await deleteItemUserData.save();
                    }
                }
                // Delete the item from environments
                const deleteItemEnvironments = deleteItemData.itemEnvironments;
                for (const environment of deleteItemEnvironments) {
                    const deleteItemEnvironmentData = await environmentDatabaseSchema_1.default.findOne({
                        environmentName: environment,
                    });
                    const deleteItemIndex = deleteItemEnvironmentData.environmentItems.findIndex((item) => item.itemName === deleteItemName);
                    if (deleteItemIndex > -1) {
                        deleteItemEnvironmentData.environmentItems.splice(deleteItemIndex, 1);
                        await deleteItemEnvironmentData.save();
                    }
                }
                // Delete the item from the database.
                itemDatabaseSchema_1.default.deleteOne({ itemName: deleteItemName });
                await modalInteraction.reply({
                    content: `Successfully deleted item ${deleteItemName}.`,
                    ephemeral: true,
                });
                break;
            // Status Effect Modals
            case "create-status-effect-modal":
                // get input values
                const statusEffectName = modalInteraction.fields
                    .getTextInputValue("create-status-effect-name-input")
                    .toLowerCase();
                const statusEffectDuration = modalInteraction.fields
                    .getTextInputValue("create-status-effect-duration-input")
                    .toLowerCase();
                const statusEffectDescription = modalInteraction.fields.getTextInputValue("create-status-effect-description-input");
                const statusEffectAction = modalInteraction.fields.getTextInputValue("create-status-effect-action-input");
                // Validate the inputs
                if (statusEffectName === "" ||
                    statusEffectDuration === "" ||
                    statusEffectDescription === "" ||
                    statusEffectAction === "") {
                    await modalInteraction.reply({
                        content: "Please fill in the required fields.",
                        ephemeral: true,
                    });
                    return;
                }
                if (!checkItemActionSyntax(statusEffectAction)) {
                    await modalInteraction.reply({
                        content: "Invalid status effect action syntax. Use 'none' for no action.",
                        ephemeral: true,
                    });
                    return;
                }
                // check if status effect already exists
                const statusEffectExistingData = await statusEffectDatabaseSchema_1.default.findOne({
                    statusEffectName: statusEffectName,
                });
                if (statusEffectExistingData) {
                    await modalInteraction.reply({
                        content: "Status effect already exists. Check database for more information.",
                        ephemeral: true,
                    });
                    return;
                }
                const statusEffectDurationMs = (0, ms_1.default)(statusEffectDuration);
                if (statusEffectDurationMs < 0 ||
                    statusEffectDurationMs > 86400000 ||
                    isNaN(statusEffectDurationMs)) {
                    await modalInteraction.reply({
                        content: "Status effect duration invalid!",
                        ephemeral: true,
                    });
                    return;
                }
                // create status effect
                const statusEffectNew = new statusEffectDatabaseSchema_1.default({
                    statusEffectName: statusEffectName,
                    statusEffectDuration: statusEffectDurationMs,
                    statusEffectDescription: statusEffectDescription,
                    statusEffectAction: statusEffectAction,
                });
                await statusEffectNew.save();
                await modalInteraction.reply({
                    content: `Successfully created status effect ${statusEffectName}.`,
                    ephemeral: true,
                });
                break;
            case "delete-status-effect-modal":
                // get input values
                const deleteStatusEffectName = modalInteraction.fields
                    .getTextInputValue("delete-status-effect-name-input")
                    .toLowerCase();
                // Validate the inputs
                const deleteStatusEffectData = await statusEffectDatabaseSchema_1.default.findOne({
                    statusEffectName: deleteStatusEffectName,
                });
                if (!deleteStatusEffectData) {
                    await modalInteraction.reply({
                        content: "Status effect not found, make sure it exist in the database",
                        ephemeral: true,
                    });
                    return;
                }
                // delete status effect from all users
                deleteStatusEffectData.statusEffectUsers.forEach(async (user) => {
                    await userDatabaseSchema_1.default.findOne({ userId: user }).then((user) => {
                        if (user) {
                            user.statusEffects = user.statusEffects.filter((effect) => effect.statusEffectName !== deleteStatusEffectName);
                        }
                    });
                });
                await statusEffectDatabaseSchema_1.default.deleteOne({
                    statusEffectName: deleteStatusEffectName,
                });
                await modalInteraction.reply({
                    content: `Successfully deleted status effect ${deleteStatusEffectName}.`,
                    ephemeral: true,
                });
                break;
            case "grant-status-effect-modal":
                // get input values
                const grantStatusEffectName = modalInteraction.fields.getTextInputValue("grant-status-effect-name-input");
                const grantStatusEffectTarget = modalInteraction.fields.getTextInputValue("grant-status-effect-target-input");
                // Validate the inputs
                const grantStatusEffectData = await statusEffectDatabaseSchema_1.default.findOne({
                    statusEffectName: grantStatusEffectName,
                });
                if (!grantStatusEffectData) {
                    await modalInteraction.reply({
                        content: "Status effect not found, make sure it exists in the database",
                        ephemeral: true,
                    });
                    return;
                }
                const grantStatusEffectTargetData = await userDatabaseSchema_1.default.findOne({
                    userId: grantStatusEffectTarget,
                    guildId: modalInteraction.guild.id,
                });
                if (!grantStatusEffectTargetData) {
                    await modalInteraction.reply({
                        content: "User not found!",
                        ephemeral: true,
                    });
                    return;
                }
                grantStatusEffectTargetData.statusEffects.push({
                    statusEffectName: grantStatusEffectData.statusEffectName,
                    statusEffectTimestamp: Date.now(),
                });
                await grantStatusEffectTargetData.save();
                await modalInteraction.reply({
                    content: `Successfully granted status effect ${grantStatusEffectName} to ${grantStatusEffectTarget}.`,
                    ephemeral: true,
                });
                break;
            // Environment Modals
            case "create-environment-modal":
                // get input values
                const createEnvironmentName = modalInteraction.fields
                    .getTextInputValue("create-environment-name-input")
                    .toLowerCase();
                const createEnvironmentItemsPromises = modalInteraction.fields
                    .getTextInputValue("create-environment-items-input")
                    .toLowerCase()
                    .split(",");
                const createEnvironmentChannel = parseInt(modalInteraction.fields.getTextInputValue("create-environment-channel-input"));
                // Remove leading/trailing whitespaces from each item name
                const createEnvironmentItems = createEnvironmentItemsPromises.map((item) => item.trim());
                // Validate item names
                const createEnvironmentItemsChecked = await Promise.all(createEnvironmentItems.map(async (itemName) => {
                    const item = await itemDatabaseSchema_1.default.findOne({ itemName });
                    return item;
                }));
                // Validate the inputs
                if (isNaN(createEnvironmentChannel)) {
                    await modalInteraction.reply({
                        content: "Channel ID invalid!",
                        ephemeral: true,
                    });
                    return;
                }
                if (await environmentDatabaseSchema_1.default.findOne({
                    environmentName: createEnvironmentName,
                })) {
                    await modalInteraction.reply({
                        content: `Environment ${createEnvironmentName} already exists.`,
                        ephemeral: true,
                    });
                    return;
                }
                // Check if all items exist
                const invalidItems = createEnvironmentItemsChecked.filter((item) => !item);
                if (invalidItems.length > 0) {
                    await modalInteraction.reply({
                        content: `Items ${invalidItems
                            .map((item, index) => createEnvironmentItems[index])
                            .join(", ")} not found, make sure they exist in the database.`,
                        ephemeral: true,
                    });
                    return;
                }
                else {
                }
                // give all items the environment name
                createEnvironmentItemsChecked.forEach(async (item) => {
                    const itemDataInstance = await itemDatabaseSchema_1.default.findOne({
                        itemName: item.itemName,
                    });
                    if (!itemDataInstance)
                        return;
                    itemDataInstance.itemEnvironments.push(createEnvironmentName);
                    itemDataInstance.save();
                });
                // create environment
                const createEnvironment = new environmentDatabaseSchema_1.default({
                    environmentName: createEnvironmentName,
                    environmentItems: createEnvironmentItemsChecked.map((item) => item.itemName),
                    environmentChannel: createEnvironmentChannel,
                });
                await createEnvironment.save();
                await modalInteraction.reply({
                    content: `Successfully created environment ${createEnvironmentName}.\n With items ${createEnvironmentItems.join(", ")}.`,
                    ephemeral: true,
                });
                break;
            case "edit-environment-modal":
                // get input values
                const editEnvironmentName = modalInteraction.fields
                    .getTextInputValue("edit-environment-name-input")
                    .toLowerCase()
                    .trim();
                // Validate the inputs
                if (!(await environmentDatabaseSchema_1.default.findOne({
                    environmentName: editEnvironmentName,
                }))) {
                    await modalInteraction.reply({
                        content: `Environment ${editEnvironmentName} not found.`,
                        ephemeral: true,
                    });
                    return;
                }
                // Share variable
                const sharedStateInstance = new EditEnvironmentSharedState();
                sharedStateInstance.name = editEnvironmentName;
                // edit environment buttons
                const editEnvironmentButtons = [
                    new discord_js_1.ButtonBuilder()
                        .setCustomId("edit-environment-items-button")
                        .setLabel("Edit Items")
                        .setStyle(discord_js_1.ButtonStyle.Primary),
                    new discord_js_1.ButtonBuilder()
                        .setCustomId("edit-environment-users-button")
                        .setLabel("Edit Users")
                        .setStyle(discord_js_1.ButtonStyle.Primary),
                    new discord_js_1.ButtonBuilder()
                        .setCustomId("edit-environment-channels-button")
                        .setLabel("Edit Channels")
                        .setStyle(discord_js_1.ButtonStyle.Primary),
                ];
                modalInteraction.reply({
                    components: (0, buttonWrapper_1.default)(editEnvironmentButtons),
                    ephemeral: true,
                });
                break;
            case "edit-environment-items-modal":
                // get input values
                const editEnvironmentItemsOperator = modalInteraction.fields.getTextInputValue("edit-environment-items-operator-input");
                const editEnvironmentItemsString = modalInteraction.fields.getTextInputValue("edit-environment-items-value-input");
                // Validate the inputs
                if (editEnvironmentItemsOperator !== "add" &&
                    editEnvironmentItemsOperator !== "remove") {
                    await modalInteraction.reply({
                        content: "Invalid operator! Valid operators: add, remove.",
                        ephemeral: true,
                    });
                    return;
                }
                const editEnvironmentItemsObjects = editEnvironmentItemsString
                    .toLowerCase()
                    .split(",")
                    .map(async (item) => {
                    item.trim();
                    const itemDataInstance = await itemDatabaseSchema_1.default.findOne({ itemName: item });
                    if (!itemDataInstance)
                        return null;
                    return itemDataInstance.itemName;
                });
                for (const item of editEnvironmentItemsObjects) {
                    if (!item) {
                        await modalInteraction.reply({
                            content: `Item ${item} not found, make sure it exists in the database.`,
                            ephemeral: true,
                        });
                        return;
                    }
                }
                switch (editEnvironmentItemsOperator) {
                    case "add":
                        const { name } = new EditEnvironmentSharedState();
                        console.log(name);
                        break;
                    case "remove":
                        break;
                }
                break;
            // Bot Perform Modals
            case "send-message-modal":
                // get input values
                let sendMessageChannel = modalInteraction.fields
                    .getTextInputValue("send-message-target-channel-input")
                    .toLowerCase();
                const sendMessageContent = modalInteraction.fields.getTextInputValue("send-message-content-input");
                // Validate and format the inputs
                if (sendMessageChannel === "here") {
                    sendMessageChannel = modalInteraction.channel.id;
                }
                const sendMessageChannelObj = modalInteraction.guild.channels.cache.get(sendMessageChannel);
                if (!sendMessageChannelObj) {
                    await modalInteraction.reply({
                        content: "Channel not found!",
                        ephemeral: true,
                    });
                    return;
                }
                // send message
                await sendMessageChannelObj.send(sendMessageContent);
                await modalInteraction.reply({
                    content: `Sent message in ${sendMessageChannelObj.name}.`,
                    ephemeral: true,
                });
                break;
            // Moderation Modals
            case "ban-user-modal":
                // get input values
                const banUserId = modalInteraction.fields.getTextInputValue("ban-user-target-input");
                const banUserReason = modalInteraction.fields.getTextInputValue("ban-user-reason-input");
                // Validate the inputs
                if (banUserId === "") {
                    await modalInteraction.reply({
                        content: "Please fill in the required fields.",
                        ephemeral: true,
                    });
                    return;
                }
                const buttonConfirm = new discord_js_1.ButtonBuilder()
                    .setCustomId("ban-user-confirm")
                    .setLabel("Confirm")
                    .setStyle(discord_js_1.ButtonStyle.Danger)
                    .setDisabled(false);
                const buttonCancel = new discord_js_1.ButtonBuilder()
                    .setCustomId("ban-user-cancel")
                    .setLabel("Cancel")
                    .setStyle(discord_js_1.ButtonStyle.Success)
                    .setDisabled(false);
                await modalInteraction.reply({
                    content: "Are you sure you want to ban this user?",
                    ephemeral: true,
                    components: (0, buttonWrapper_1.default)([buttonConfirm, buttonCancel]),
                });
                const collector = modalInteraction.channel.createMessageComponentCollector({
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
                const kickUserId = modalInteraction.fields.getTextInputValue("kick-user-target-input");
                const kickUserReason = modalInteraction.fields.getTextInputValue("kick-user-reason-input") ||
                    "No reason provided";
                // get the target user object
                const kickUser = await modalInteraction.guild.members
                    .fetch(kickUserId)
                    ?.catch(() => null);
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
                const kickUserRequesterRolePosition = modalInteraction.member.roles.highest.position;
                const kickUserBotRolePosition = modalInteraction.guild.members.me.roles.highest.position;
                // check if the target user is of a higher position than the request user
                if (kickUserRolePosition >= kickUserRequesterRolePosition) {
                    await modalInteraction.reply({
                        content: "That user is of a higher position of the power hierarchy than you. Therefore you cannot kick them.",
                        ephemeral: true,
                    });
                    return;
                }
                // check if the target user is of a higher position than the bot
                if (kickUserRolePosition >= kickUserBotRolePosition) {
                    await modalInteraction.reply({
                        content: "That user is of a higher position of the power hierarchy than me. Therefore i cannot kick them.",
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
                }
                catch (error) {
                    console.error("Error kicking user: ", error);
                }
                break;
            case "timeout-user-modal":
                // get input values
                const timeoutUserId = modalInteraction.fields.getTextInputValue("timeout-user-target-input");
                let timeoutUserDuration = modalInteraction.fields.getTextInputValue("timeout-user-duration-input");
                const timeoutUserReason = modalInteraction.fields.getTextInputValue("timeout-user-reason-input") || "No reason provided";
                // get the target user object
                const timeoutUser = await modalInteraction.guild.members
                    .fetch(timeoutUserId)
                    ?.catch(() => null);
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
                const timeoutUserDurationMs = (0, ms_1.default)(timeoutUserDuration);
                //check if duration is valid
                if (isNaN(timeoutUserDurationMs)) {
                    await modalInteraction.reply({
                        content: "Invalid duration. Please enter a valid duration.",
                        ephemeral: true,
                    });
                    return;
                }
                //check if the duration is below 5 seconds or above 28 days
                if (timeoutUserDurationMs < 5000 ||
                    timeoutUserDurationMs > 28 * 24 * 60 * 60 * 1000) {
                    await modalInteraction.reply({
                        content: "Invalid duration. Please enter a duration between 5 seconds and 28 days.",
                        ephemeral: true,
                    });
                    return;
                }
                // define role positions
                const timeoutUserRolePosition = timeoutUser.roles.highest.position;
                const timeoutUserRequesterRolePosition = modalInteraction.member.roles.highest.position;
                const timeoutUserBotRolePosition = modalInteraction.guild.members.me.roles.highest.position;
                // check if the target user is of a higher position than the request user
                if (timeoutUserRolePosition >= timeoutUserRequesterRolePosition) {
                    await modalInteraction.reply({
                        content: "That user is of a higher position of the power hierarchy than you. Therefore you cannot timeout them.",
                        ephemeral: true,
                    });
                    return;
                }
                // check if the target user is of a higher position than the bot
                if (timeoutUserRolePosition >= timeoutUserBotRolePosition) {
                    await modalInteraction.reply({
                        content: "That user is of a higher position of the power hierarchy than me. Therefore i cannot timeout them.",
                        ephemeral: true,
                    });
                    return;
                }
                // timeout the user
                try {
                    await timeoutUser.timeout(timeoutUserDuration, timeoutUserReason);
                    await modalInteraction.reply({
                        content: `The user <@${timeoutUser.user.id}> has been timed out successfully.\n${timeoutUserReason}`,
                        ephemeral: true,
                    });
                }
                catch (error) {
                    console.error("Error timing out user: ", error);
                }
                break;
            default:
                modalInteraction.reply({
                    content: "Uhh something went wrong",
                    ephemeral: true,
                });
                break;
        }
    }
    catch (error) {
        console.error("Error handling modal submission:", error);
    }
};

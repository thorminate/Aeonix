import { ModalSubmitInteraction } from "discord.js";
import UserData from "../../models/userDatabaseSchema";

interface Options {
  variant: "strength" | "will" | "cognition" | "level" | "exp";
  modifier: "add" | "remove" | "set";
  amount: number;
  userId: string;
}
/**
 * Gives a defined amount of stat point(s) to the target user.
 * @param {ModalSubmitInteraction} interaction The interaction that ran the command.
 * @param {Options} options The variant, modifier, and amount of stat point(s) to be given.
 * @returns {Promise<void>}
 */
export default async (
  interaction: ModalSubmitInteraction,
  options: Options
): Promise<void> => {
  let { variant, modifier, amount, userId } = options;
  const userObj = await interaction.guild.members.fetch(userId); // Fetch the target user by their ID

  if (!userObj) {
    // Check if the target user is not found
    await interaction.reply({
      // Reply with an error message if so
      content: "User not found.",
      ephemeral: true,
    });
    return;
  }

  const userData = await UserData.findOne({
    // Find the target user in the database
    id: userObj.user.id,
    guild: interaction.guild.id,
  });

  if (!userData) {
    // Check if the target user is not found in the database
    await interaction.reply({
      // Reply with an error message if so
      content:
        "User not found in the database. Please make sure the user has at least sent one message before running this command.",
      ephemeral: true,
    });
    return;
  }

  switch (
    modifier // Go through the modifiers and variants and update the target user's stats accordingly.
  ) {
    case "add":
      switch (variant) {
        case "strength":
          userData.strength = userData.strength + amount;
          break;
        case "will":
          userData.will = userData.will + amount;
          break;
        case "cognition":
          userData.cognition = userData.cognition + amount;
          break;
        case "level":
          userData.level = userData.level + amount;
          break;
        case "exp":
          userData.exp = userData.exp + amount;
          break;
      }

      await userData.save();

      await interaction.reply({
        content: `Successfully gave <@${userObj.user.id}> **${amount}** stat point(s) to the ${variant} variant!`,
        ephemeral: true,
      });
      break;

    case "remove":
      switch (variant) {
        case "strength":
          userData.strength = userData.strength - amount;
          if (userData.strength < 0) {
            userData.strength = 0;
          }
          break;

        case "will":
          userData.will = userData.will - amount;
          if (userData.will < 0) {
            userData.will = 0;
          }
          break;

        case "cognition":
          userData.cognition = userData.cognition - amount;
          if (userData.cognition < 0) {
            userData.cognition = 0;
          }
          break;

        case "level":
          userData.level = userData.level - amount;
          if (userData.level < 0) {
            userData.level = 0;
          }
          break;

        case "exp":
          userData.exp = userData.exp - amount;
          if (userData.exp < 0) {
            userData.exp = 0;
          }
          break;
      }

      await userData.save();

      await interaction.reply({
        content: `Successfully took <@${userObj.user.id}> **${amount}** stat point(s) from ${variant}!`,
        ephemeral: true,
      });
      break;

    case "set":
      if (amount < 0) {
        amount = 0;
      }

      switch (variant) {
        case "strength":
          userData.strength = amount;
          break;
        case "will":
          userData.will = amount;
          break;
        case "cognition":
          userData.cognition = amount;
          break;
        case "level":
          userData.level = amount;
          break;
        case "exp":
          userData.exp = amount;
          break;
      }

      await userData.save();

      await interaction.reply({
        content: `Successfully set <@${userObj.user.id}>'s ${variant} to **${amount}!**`,
        ephemeral: true,
      });
      break;
  }
};

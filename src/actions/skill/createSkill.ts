import { ModalSubmitInteraction } from "discord.js";
import skillData from "../../models/SkillData";

interface Options {
  name: string;
  description: string;
  action: string;
  cooldown: number;
  will: number;
}
/**
 * Creates a new skill in the database.
 * @param {ModalSubmitInteraction} interaction The interaction that ran the command.
 * @param {Options} options The name, description, action, cooldown, and will of the skill.
 * @returns {Promise<void>}
 */
export default async (
  interaction: ModalSubmitInteraction,
  options: Options
): Promise<void> => {
  // Validate the inputs
  // check if skill already exists
  if (await skillData.findOne({ name: options.name })) {
    await interaction.reply({
      content: "Skill already exists. Please choose a different name.",
      ephemeral: true,
    });
    return;
  }

  // create a new skill and store it in the database

  const newSkill = new skillData({
    name: options.name,
    description: options.description,
    action: options.action,
    cooldown: options.cooldown,
    will: options.will,
  });

  await newSkill.save();

  await interaction.reply({
    content: `Successfully created skill ${options.name}.`,
    ephemeral: true,
  });
};

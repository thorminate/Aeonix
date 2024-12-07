import { ModalSubmitInteraction } from "discord.js";
import skillData from "../../models/SkillData";
import userData from "../../models/UserData";

/**
 * Deletes a skill from the database.
 * @param {ModalSubmitInteraction} interaction The interaction that ran the command.
 * @param {string} skillName The name of the skill to be deleted.
 * @returns {Promise<void>}
 */
export default async (
  interaction: ModalSubmitInteraction,
  skillName: string
): Promise<void> => {
  const skill = await skillData.findOne({
    name: skillName,
  });
  if (!skill) {
    await interaction.reply({
      content: `Skill ${skillName} not found. Make sure you entered a valid skill name. Or create a new skill.`,
      ephemeral: true,
    });
    return;
  }
  // first delete the skill from all users that have it
  const skillUsers = await userData.find({
    id: { $in: skill.users },
  });

  skillUsers.forEach(async (skillUser) => {
    skillUser.skills = skillUser.skills.filter((skill) => skill !== skillName);
    await skillUser.save();
  });

  // delete the skill from the database
  await skill.deleteOne();

  await interaction.reply({
    content: `Successfully deleted skill ${skillName}.`,
    ephemeral: true,
  });
};

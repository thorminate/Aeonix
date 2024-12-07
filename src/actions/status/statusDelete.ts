import { ModalSubmitInteraction } from "discord.js";
import StatusEffectData from "../../models/StatusEffectsData";
import UserData from "../../models/UserData";

/**
 * Deletes a status effect from the database.
 * @param {ModalSubmitInteraction} interaction The interaction that ran the command.
 * @param {string} name The name of the status effect to be deleted.
 */
export default async (
  interaction: ModalSubmitInteraction,
  name: string
): Promise<void> => {
  const statusEffectData = await StatusEffectData.findOne({
    name,
  });

  if (!statusEffectData) {
    await interaction.reply({
      content: "Status effect not found, make sure it exist in the database",
      ephemeral: true,
    });
    return;
  }

  // delete status effect from all users
  statusEffectData.users.forEach(async (user) => {
    await UserData.findOne({ id: user }).then((user) => {
      if (user) {
        user.statusEffects = user.statusEffects.filter(
          (effect) => effect.statusEffectName !== name
        );
      }
    });
  });

  await statusEffectData.deleteOne();

  await interaction.reply({
    content: `Successfully deleted status effect ${name}.`,
    ephemeral: true,
  });
};

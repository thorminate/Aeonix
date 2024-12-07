import { ModalSubmitInteraction } from "discord.js";
import StatusEffectData from "../../models/StatusEffectsData";
import UserData from "../../models/UserData";

interface Options {
  statusEffectName: string;
  targetId: string;
}
export default async (
  interaction: ModalSubmitInteraction,
  options: Options
): Promise<void> => {
  const { statusEffectName, targetId } = options;

  const statusEffectData = await StatusEffectData.findOne({
    name: statusEffectName,
  });

  if (!statusEffectData) {
    await interaction.reply({
      content: "Status effect not found, make sure it exists in the database",
      ephemeral: true,
    });
    return;
  }

  const targetData = await UserData.findOne({
    id: targetId,
    guild: interaction.guild.id,
  });

  if (!targetData) {
    await interaction.reply({
      content: "User not found!",
      ephemeral: true,
    });
    return;
  }

  targetData.statusEffects.push({
    name: statusEffectData.name,
    timestamp: Date.now() + statusEffectData.duration,
  });

  statusEffectData.users.push(targetId);

  await statusEffectData.save();
  await targetData.save();
  await interaction.reply({
    content: `Successfully granted status effect ${statusEffectName} to <@${targetId}>. With a duration of ${statusEffectData.duration}ms`,
    ephemeral: true,
  });

  setInterval(async () => {
    const userData = await UserData.findOne({
      id: targetId,
      guild: interaction.guild.id,
    });
    console.log(userData);

    if (!userData) return;

    const statusEffect = userData.statusEffects.find((statusEffect) => {
      return statusEffect.name === statusEffectName;
    });

    console.log(statusEffect);

    if (!statusEffect) return;

    if (statusEffect.timestamp < Date.now()) {
      console.log("Status Effect Expired");

      userData.statusEffects = userData.statusEffects.filter(
        (statusEffect) => statusEffect.name !== statusEffectName
      );
      const statusEffectData = await StatusEffectData.findOne({
        name: statusEffectName,
      });

      statusEffectData.users.filter((user: string) => {
        user !== targetId;
      });

      await userData.save();
      await statusEffectData.save();

      return;
    }
  }, 2000);
};

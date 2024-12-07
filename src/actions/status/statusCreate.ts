import { ModalSubmitInteraction } from "discord.js";
import StatusEffectData from "../../models/StatusEffectsData";
import ms from "ms";

interface Options {
  name: string;
  description: string;
  duration: number;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { name, description, duration } = options;
  if (
    await StatusEffectData.findOne({
      name: name,
    })
  ) {
    await interaction.reply({
      content:
        "Status effect already exists. Check database for more information.",
      ephemeral: true,
    });
    return;
  }

  const durationMs = parseInt(ms(duration));

  if (durationMs < 0 || durationMs > 86400000 || isNaN(durationMs)) {
    await interaction.reply({
      content: "Status effect duration invalid!",
      ephemeral: true,
    });
    return;
  }
  // create status effect

  const statusEffectNew = new StatusEffectData({
    name: name,
    duration: durationMs,
    description: description,
  });

  await statusEffectNew.save();
  await interaction.reply({
    content: `Successfully created status effect ${name}.`,
    ephemeral: true,
  });
};

import { ModalSubmitInteraction } from "discord.js";
import EnvironmentData from "../../models/EnvironmentData";

interface Options {
  oldName: string;
  newName: string;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { oldName, newName } = options;

  // Validate and format the inputs
  const environmentData = await EnvironmentData.findOne({
    name: oldName,
  });

  if (environmentData) {
    environmentData.name = newName;
    await environmentData.save();

    await interaction.reply({
      content: `Successfully renamed environment ${oldName} to ${newName}.`,
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content: "Environment not found!",
      ephemeral: true,
    });
  }
};

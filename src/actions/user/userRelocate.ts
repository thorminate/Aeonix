import { ModalSubmitInteraction } from "discord.js";
import EnvironmentData from "../../models/environmentDatabaseSchema";
import UserData from "../../models/userDatabaseSchema";

interface Options {
  userId: Array<string>;
  environmentName: string;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { userId, environmentName } = options;

  const environmentData = await EnvironmentData.findOne({
    name: environmentName,
  });

  if (!environmentData) {
    await interaction.reply({
      content: "Environment not found!",
      ephemeral: true,
    });
    return;
  }

  userId.forEach(async (relocateUserId: string) => {
    const relocateUserObj = await UserData.findOne({
      id: relocateUserId,
    });

    if (!relocateUserObj) {
      await interaction.reply({
        content: "User not found!",
        ephemeral: true,
      });
      return;
    }
    const prevEnvironmentData = await EnvironmentData.findOne({
      name: relocateUserObj.environment,
    });

    if (prevEnvironmentData) {
      prevEnvironmentData.users = prevEnvironmentData.users.filter(
        (user: string) => user !== relocateUserId
      );

      await prevEnvironmentData.save();
    }

    relocateUserObj.environment = environmentData.name;
    environmentData.users.push(relocateUserId);
    await relocateUserObj.save();
    await relocateUserObj.save();
  });

  await interaction.reply({
    content: `Successfully relocated user(s) <@${userId.join(
      ">, <@"
    )}> to environment ${environmentName}.`,
    ephemeral: true,
  });
};

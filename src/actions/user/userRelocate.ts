import {
  CommandInteraction,
  ModalSubmitInteraction,
  TextChannel,
} from "discord.js";
import EnvironmentData from "../../models/EnvironmentData";
import UserData from "../../models/UserData";

interface Options {
  users: Array<string>;
  name: string;
}

export default async (
  interaction: ModalSubmitInteraction | CommandInteraction,
  options: Options
) => {
  const { users, name } = options;

  if (interaction.isModalSubmit()) {
    const environmentData = await EnvironmentData.findOne({
      name,
    });

    if (!environmentData) {
      await interaction.reply({
        content: "Environment not found!",
        ephemeral: true,
      });
      return;
    }

    users.forEach(async (userId: string) => {
      const userObj = await UserData.findOne({
        id: userId,
      });

      if (!userObj) {
        await interaction.reply({
          content: "User not found!",
          ephemeral: true,
        });
        return;
      }
      const prevEnvironmentData = await EnvironmentData.findOne({
        name: userObj.environment,
      });

      if (prevEnvironmentData) {
        prevEnvironmentData.users = prevEnvironmentData.users.filter(
          (user: string) => user !== userObj.id
        );

        const prevEnvironmentChannel = interaction.guild.channels.cache.get(
          prevEnvironmentData.channel
        );

        if (!(prevEnvironmentChannel instanceof TextChannel)) {
          await interaction.reply({
            content: "Channel isn't a text channel!",
            ephemeral: true,
          });
          return;
        }

        await prevEnvironmentChannel?.send({
          content: `<@${userObj.id}> has left this environment.`,
        });

        await prevEnvironmentChannel?.permissionOverwrites.edit(userObj.id, {
          ViewChannel: false,
        });

        await prevEnvironmentData.save();
      }

      userObj.environment = environmentData.name;
      const environmentChannel = await interaction.guild.channels.cache.get(
        environmentData.channel
      );

      if (!(environmentChannel instanceof TextChannel)) {
        throw new Error("Channel isn't a text channel!");
      }

      await environmentChannel?.permissionOverwrites.create(userObj.id, {
        ViewChannel: true,
      });

      await environmentChannel?.send({
        content: `<@${userObj.id}> has joined this environment.`,
      });

      environmentData.users.push(userObj.id);
      await userObj.save();
      await environmentData.save();
    });

    await interaction.reply({
      content: `Successfully relocated user(s) <@${users.join(
        ">, <@"
      )}> to environment ${name}.`,
      ephemeral: true,
    });
  } else if (interaction.isCommand()) {
    const environmentData = await EnvironmentData.findOne({
      name,
    });

    if (!environmentData) {
      throw new Error("Environment not found!");
    }

    users.forEach(async (relocateUserId: string) => {
      const userObj = await UserData.findOne({
        id: relocateUserId,
      });

      if (!userObj) {
        throw new Error("User not found!");
      }
      const prevEnvironmentData = await EnvironmentData.findOne({
        name: userObj.environment,
      });

      if (prevEnvironmentData) {
        prevEnvironmentData.users = prevEnvironmentData.users.filter(
          (user: string) => user !== relocateUserId
        );
        const prevEnvironmentChannel =
          await interaction.guild.channels.cache.get(
            prevEnvironmentData.channel
          );

        if (!(prevEnvironmentChannel instanceof TextChannel)) {
          throw new Error("Channel isn't a text channel!");
        }

        await prevEnvironmentChannel?.send({
          content: `<@${userObj.id}> has left this environment.`,
        });

        await prevEnvironmentChannel?.permissionOverwrites.edit(userObj.id, {
          ViewChannel: false,
        });

        await prevEnvironmentData.save();
      }

      userObj.environment = environmentData.name;
      const environmentChannel = await interaction.guild.channels.cache.get(
        environmentData.channel
      );

      if (!(environmentChannel instanceof TextChannel)) {
        throw new Error("Channel isn't a text channel!");
      }

      await environmentChannel?.permissionOverwrites.create(userObj.id, {
        ViewChannel: true,
      });

      await environmentChannel?.send({
        content: `<@${userObj.id}> has joined this environment.`,
      });

      environmentData.users.push(relocateUserId);
      await userObj.save();
      await environmentData.save();
    });
  }
};

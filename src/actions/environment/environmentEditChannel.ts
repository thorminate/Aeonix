import { ModalSubmitInteraction } from "discord.js";
import EnvironmentData from "../../models/environmentDatabaseSchema";

interface Options {
  name: string;
  channel: string;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { name, channel } = options;

  const editEnvironmentChannelData = await interaction.guild.channels.cache.get(
    channel
  );
  if (!editEnvironmentChannelData) {
    await interaction.reply({
      content: "Channel not found!",
      ephemeral: true,
    });
    return;
  }

  const editEnvironmentChannelObj = await EnvironmentData.findOne({
    name,
  });

  if (!editEnvironmentChannelObj) {
    await interaction.reply({
      content: "Environment not found!",
      ephemeral: true,
    });
    return;
  }

  editEnvironmentChannelObj.channel = channel;
  await editEnvironmentChannelObj.save();
  await interaction.reply({
    content: `Successfully edited environment ${name}'s channel to <#${channel}>.`,
    ephemeral: true,
  });
};

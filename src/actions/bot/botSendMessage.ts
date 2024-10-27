import { ModalSubmitInteraction, TextChannel } from "discord.js";

interface Options {
  channel: string;
  content: string;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
): Promise<void> => {
  let { channel, content } = options;

  // Validate and format the inputs
  if (channel === "here") {
    channel = interaction.channel.id;
  }
  const channelData = interaction.guild.channels.cache.get(channel);

  if (!channelData) {
    await interaction.reply({
      content: "Channel not found!",
      ephemeral: true,
    });
    return;
  }

  // send message
  await (channelData as TextChannel).send(content);
  await interaction.reply({
    content: `Sent message in <#${channelData.id}>.`,
    ephemeral: true,
  });
};

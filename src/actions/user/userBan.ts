import { ButtonBuilder, ButtonStyle, ModalSubmitInteraction } from "discord.js";
import buttonWrapper from "../../utils/buttonWrapper";

interface BanOptions {
  user: string;
  reason: string;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: BanOptions
) => {
  const { user, reason } = options;

  const userObj = await interaction.guild.members.fetch(user); // Fetch the target user by their ID

  if (!userObj) {
    await interaction.reply({
      content: "User not found.",
      ephemeral: true,
    });
    return;
  }
  if (userObj.bannable === false) {
    await interaction.reply({
      content: "This user cannot be banned.",
      ephemeral: true,
    });
    return;
  }

  const buttonConfirm = new ButtonBuilder()
    .setCustomId("ban-user-confirm")
    .setLabel("Confirm")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(false);

  const buttonCancel = new ButtonBuilder()
    .setCustomId("ban-user-cancel")
    .setLabel("Cancel")
    .setStyle(ButtonStyle.Success)
    .setDisabled(false);

  await interaction.reply({
    content: "Are you sure you want to ban this user?",
    ephemeral: true,
    components: buttonWrapper([buttonConfirm, buttonCancel]),
  });

  const collector = interaction.channel.createMessageComponentCollector({
    filter: (usr) => usr.user.id === interaction.user.id,
    max: 1,
  });

  collector.on("collect", async (i) => {
    if (i.customId === "ban-user-confirm") {
      await userObj.ban({ reason: reason });
      await interaction.followUp({
        content: "User has been banned; check audit logs for more information.",
        ephemeral: true,
      });
    } else if (i.customId === "ban-user-cancel") {
      await interaction.deleteReply();
    }
  });
};

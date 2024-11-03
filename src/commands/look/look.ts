import { Client, CommandInteraction, GuildMember } from "discord.js";
import commandVerify from "../../utils/commandVerify";
import UserData from "../../models/userDatabaseSchema";
import EnvironmentData from "../../models/environmentDatabaseSchema";
import log from "../../utils/log";
import { config } from "dotenv";
config({
  path: "../../../.env",
});

module.exports = {
  name: "look",
  description: "Look around in your current environment",
  //devOnly: Boolean,
  //testOnly: true,
  //permissionsRequired: [PermissionFlagsBits.Administrator],
  //botPermissions: [PermissionFlagsBits.Administrator],
  //options: [],
  //deleted: true,
  callback: async (bot: Client, interaction: CommandInteraction) => {
    try {
      if (!commandVerify(interaction)) return;

      await interaction.deferReply({
        ephemeral: true,
      });

      const userData = await UserData.findOne({
        id: interaction.user.id,
        guild: interaction.guild.id,
      });

      if (!userData) {
        await interaction.editReply({
          content: `You haven't been integrated into Aeonix's database yet. Head over to <#${process.env.ONBOARDING_CHANNEL}>`,
        });
        return;
      }

      const userEnvironmentData = await EnvironmentData.findOne({
        name: userData.environment,
      });

      if (!userEnvironmentData) {
        await interaction.editReply({
          content: "You aren't inside an environment",
        });
        return;
      }
      if (userEnvironmentData.channel !== interaction.channel.id) {
        await interaction.editReply({
          content: `You can only look in your current environment, <#${userEnvironmentData.channel}>`,
        });
        return;
      }

      await interaction.editReply({
        content: (await userEnvironmentData).items.join(", "),
      });
    } catch (error) {
      console.log(error);
      log({
        header: "Look Error",
        payload: `${error}`,
        type: "error",
      });
    }
  },
};

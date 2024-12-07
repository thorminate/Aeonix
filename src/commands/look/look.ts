import { Client, CommandInteraction, GuildMember } from "discord.js";
import commandVerify from "../../utils/commandVerify";
import UserData from "../../models/UserData";
import EnvironmentData from "../../models/EnvironmentData";
import log from "../../utils/log";
import { config } from "dotenv";
import commandPrep from "../../utils/commandPrep";
config({
  path: "../../../.env",
});

export default {
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

      await commandPrep(interaction);

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

      let content: string;
      if (userEnvironmentData.items.length === 0) {
        content = `You are in the environment ${userEnvironmentData.name}. There are no items in this environment.`;
      } else {
        content = `You are in the environment ${
          userEnvironmentData.name
        }. The items in this environment are: ${userEnvironmentData.items.join(
          ", "
        )}`;
      }
      await interaction.editReply({
        content,
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

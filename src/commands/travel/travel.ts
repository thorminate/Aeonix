import { Client, CommandInteraction } from "discord.js";
import log from "../../utils/log";
import commandVerify from "../../utils/commandVerify";
import commandPrep from "../../utils/commandPrep";
import UserData from "../../models/UserData";
import EnvironmentData from "../../models/EnvironmentData";
import actions from "../../actions/actionIndex";

export default {
  name: "travel",
  description: "Travel to another environment",
  options: [
    {
      name: "environment",
      description: "The environment to travel to, must be close by",
      type: 3,
      required: true,
    },
  ],
  callback: async (bot: Client, interaction: CommandInteraction) => {
    try {
      //Verify that the command is valid and prep for execution

      if (!commandVerify(interaction)) return;

      await commandPrep(interaction);

      //Get required data to proceed.

      const environmentData = await EnvironmentData.findOne({
        name: await interaction.options.get("environment").value,
      });

      //Validate all data to be valid and usable.

      if (!environmentData) {
        await interaction.editReply({
          content: "The environment to travel to was not found nearby!",
        });
        return;
      }

      await actions.user.relocate(interaction, {
        users: [interaction.user.id],
        name: environmentData.name,
      });

      await interaction.editReply({
        content: `You have successfully traveled to ${environmentData.name}`,
      });
    } catch (error) {
      console.log(error);
      log({
        header: "Error originating from travel command occurred",
        payload: `${error}`,
        type: "error",
      });
    }
  },
};

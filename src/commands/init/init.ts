import {
  ButtonBuilder,
  ButtonStyle,
  Client,
  CommandInteraction,
} from "discord.js";
import commandPrep from "../../utils/commandPrep";
import Player from "../../models/player/Player";
import buttonWrapper from "../../utils/buttonWrapper";

export default {
  name: "init",
  description: "Initializes your persona.",
  //devOnly: Boolean,
  //testOnly: true,
  //permissionsRequired: [PermissionFlagsBits.Administrator],
  //botPermissions: [PermissionFlagsBits.Administrator],
  //options: [],
  //deleted: true,
  callback: async (interaction: CommandInteraction) => {
    await commandPrep(interaction);

    if (await Player.load(interaction.user.username)) {
      const buttons = buttonWrapper([
        new ButtonBuilder()
          .setCustomId("delete-player")
          .setLabel("Delete?")
          .setStyle(ButtonStyle.Danger),
      ]);

      await interaction.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const buttons = buttonWrapper([
      new ButtonBuilder()
        .setCustomId("onboarding-start")
        .setLabel("Begin")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👋"),
    ]);

    await interaction.editReply({
      content: "Welcome to the game. Please click the button below to begin.",
      components: buttons,
    });
  },
};

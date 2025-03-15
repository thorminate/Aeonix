import {
  ButtonBuilder,
  ButtonStyle,
  Client,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import commandPrep from "../../utils/commandPrep";
import Player from "../../models/player/Player";
import buttonWrapper from "../../utils/buttonWrapper";
import Command from "../command";
import {
  welcomeImage,
  welcomeMessage,
} from "../../events/ready/02register-onboarding";

export default <Command>{
  data: new SlashCommandBuilder()
    .setName("init")
    .setDescription("Initializes your persona"),
  callback: async (cmdAct: CommandInteraction) => {
    await commandPrep(cmdAct);

    if (await Player.load(cmdAct.user.username)) {
      const buttons = buttonWrapper([
        new ButtonBuilder()
          .setCustomId("delete-player")
          .setLabel("Delete?")
          .setStyle(ButtonStyle.Danger),
      ]);

      await cmdAct.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    const components = buttonWrapper([
      new ButtonBuilder()
        .setCustomId("onboarding-1")
        .setLabel("Begin")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👋"),
    ]);

    await cmdAct.editReply({
      files: [welcomeImage],
    });

    await cmdAct.followUp({
      content: welcomeMessage,
      components,
      ephemeral: true,
    });
  },
};

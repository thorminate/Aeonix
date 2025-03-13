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
      files: [
        {
          attachment: "./assets/welcome.png",
          name: "welcome.png",
        },
      ],
    });

    await cmdAct.followUp({
      content:
        "Hello, and welcome to Aeonix!" +
        " This server is primarily for testing my bot, although we have tons of RP mashed in too!" +
        "\n\nYou are currently not able to see any channels other than a few for the onboarding process and the non-player-hangout area." +
        " These channels are for setting you up, (such as initializing your persona into the database, the persona being your digital presence with Aeonix)" +
        " we will also go through the skill system and how other important stats work." +
        "\n\nWhen you have read through the information, please press the button below, and the bot will validate your persona's existence in the database," +
        " thereafter giving you the <@&1270791621289578607> role." +
        "\n\nBy pressing 'Begin', you agree to the [Terms of Service](<https://github.com/thorminate/The-System/wiki/Terms-of-Service>) and [Privacy Policy](<https://github.com/thorminate/The-System/wiki/Privacy-Policy>).",
      components,
      ephemeral: true,
    });
  },
};

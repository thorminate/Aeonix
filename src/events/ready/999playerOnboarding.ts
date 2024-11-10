import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  TextChannel,
} from "discord.js";
import log from "../../utils/log";

export default async (bot: Client) => {
  try {
    const welcomeChannel = bot.channels.cache.get("1294690937783717969");
    if (!(welcomeChannel instanceof TextChannel)) return;
    await welcomeChannel.bulkDelete(100);

    const welcomeChannelBeginOnboarding = new ButtonBuilder()
      .setCustomId("begin-onboarding")
      .setLabel("Begin Onboarding")
      .setStyle(ButtonStyle.Success)
      .setDisabled(false);

    const welcomeChannelBeginOnboardingRow =
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        welcomeChannelBeginOnboarding
      );

    await welcomeChannel.send({
      files: [
        {
          attachment: "./images/welcome.png",
          name: "welcome.png",
        },
      ],
    });
    await welcomeChannel.send({
      content:
        "Hello, and welcome to Aeonix!" +
        " This server is primarily for testing my bot, although we have tons of RP mashed in too!" +
        "\n\nYou are currently not able to see any channels other than a few for the onboarding process and the non-player-hangout area." +
        " These channels are for setting you up, (such as initializing your persona into the database, the persona being your digital presence with Aeonix)" +
        " we will also go through the skill system and how other important stats work." +
        "\n\nWhen you have read through the information, please press the button below, and the bot will validate your persona's existence in the database," +
        " thereafter giving you the <@&1270791621289578607> role." +
        "\n\nBy pressing 'Begin Onboarding', you agree to the [Terms of Service](<https://github.com/thorminate/The-System/wiki/Terms-of-Service>) and [Privacy Policy](<https://github.com/thorminate/The-System/wiki/Privacy-Policy>).",
      components: [welcomeChannelBeginOnboardingRow],
    });
  } catch (err) {
    console.log(err);
    log({
      header: "Onboarding Error",
      payload: `${err}`,
      type: "error",
    });
  }
};

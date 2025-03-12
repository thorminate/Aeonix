import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  ComponentType,
  DiscordAPIError,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { config } from "dotenv";
import buttonWrapper from "../../utils/buttonWrapper";
import log from "../../utils/log";
import { Event } from "../../handlers/eventHandler";
config();

export default async (event: Event) => {
  const onboardingChannelId = process.env.ONBOARDING_CHANNEL;

  const onboardingChannel = await event.bot.channels.fetch(onboardingChannelId);

  if (!onboardingChannel || !(onboardingChannel instanceof TextChannel)) {
    log({
      header: "Onboarding channel not found",
      type: "Error",
    });
    return;
  }

  await onboardingChannel.bulkDelete(100).catch((e) => {
    if (!(e instanceof DiscordAPIError && !(e.code === 50034))) {
      // 50034 is cannot bulk delete messages older than 14 days.
      throw e;
    } else {
      log({
        header: "Could not bulk delete messages, they are older than 14 days",
        type: "Warn",
      });
    }
  });

  const onboardingButton = new ButtonBuilder()
    .setCustomId("onboarding-start")
    .setLabel("Begin")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("👋");

  await onboardingChannel.send({
    files: [
      {
        attachment: "./assets/welcome.png",
        name: "welcome.png",
      },
    ],
  });

  const message = await onboardingChannel.send({
    content:
      "Hello, and welcome to Aeonix!" +
      " This server is primarily for testing my bot, although we have tons of RP mashed in too!" +
      "\n\nYou are currently not able to see any channels other than a few for the onboarding process and the non-player-hangout area." +
      " These channels are for setting you up, (such as initializing your persona into the database, the persona being your digital presence with Aeonix)" +
      " we will also go through the skill system and how other important stats work." +
      "\n\nWhen you have read through the information, please press the button below, and the bot will validate your persona's existence in the database," +
      " thereafter giving you the <@&1270791621289578607> role." +
      "\n\nBy pressing 'Begin Onboarding', you agree to the [Terms of Service](<https://github.com/thorminate/The-System/wiki/Terms-of-Service>) and [Privacy Policy](<https://github.com/thorminate/The-System/wiki/Privacy-Policy>).",
    components: buttonWrapper([onboardingButton]),
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });
};

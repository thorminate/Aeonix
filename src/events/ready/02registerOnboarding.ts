import {
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  DiscordAPIError,
  TextChannel,
} from "discord.js";
import log from "../../utils/log.js";
import Event from "../../models/core/event.js";
import componentWrapper from "../../utils/componentWrapper.js";

// turn on word wrap to see the full message

export const welcomeMessage = `Hello, and welcome to Aeonix! This server is primarily for testing my bot, although we have tons of RP mashed in too!
  
You are currently not able to see any channels other than a few for the onboarding process and the non-player-hangout area. These channels are for setting you up, (such as initializing your persona into the database, the persona being your digital presence with Aeonix) we will also go through the skill system and how other important stats work.
  
When you have read through the information, please press the button below, and Aeonix will validate your persona's existence in the database, thereafter giving you the <@&1270791621289578607> role.
  
By pressing 'Begin', you agree to the [Terms of Service](<https://github.com/thorminate/Aeonix/wiki/Terms-of-Service>) and [Privacy Policy](<https://github.com/thorminate/Aeonix/wiki/Privacy-Policy>).`;

export const welcomeImage = new AttachmentBuilder("./assets/welcome.png");

export default new Event({
  callback: async ({ aeonix }) => {
    const onboardingChannelId = process.env.ONBOARDING_CHANNEL;

    if (!onboardingChannelId) {
      log({
        header: "Onboarding channel id not found in environment variables",
        processName: "OnboardingSupervisor",
        type: "Error",
        payload: [onboardingChannelId, process.env],
      });
      return;
    }

    const onboardingChannel = await aeonix.channels.fetch(onboardingChannelId);

    if (!onboardingChannel || !(onboardingChannel instanceof TextChannel)) {
      log({
        header: "Onboarding channel not found",
        processName: "OnboardingSupervisor",
        type: "Error",
      });
      return;
    }

    await onboardingChannel.bulkDelete(100).catch((e: unknown) => {
      if (!(e instanceof DiscordAPIError && !(e.code === 50034))) {
        // 50034 is cannot bulk delete messages older than 14 days.
        throw e;
      } else {
        log({
          header: "Could not bulk delete messages, they are older than 14 days",
          processName: "OnboardingSupervisor",
          payload: e,
          type: "Warn",
        });
      }
    });

    const components = componentWrapper(
      new ButtonBuilder()
        .setCustomId("onboarding0")
        .setLabel("Begin")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👋")
    );

    await onboardingChannel.send({
      files: [welcomeImage],
    });

    await onboardingChannel.send({
      content: welcomeMessage,
      components,
    });

    log({
      header: "Sent onboarding messages.",
      processName: "OnboardingSupervisor",
      type: "Info",
    });
  },
  onError: async (e) => {
    log({
      header: "Error sending onboarding message",
      processName: "OnboardingSupervisor",
      payload: e,
      type: "Error",
    });
  },
});

import {
  AttachmentBuilder,
  DiscordAPIError,
  MediaGalleryBuilder,
  MessageFlags,
  TextChannel,
  TextDisplayBuilder,
  TextDisplayComponent,
} from "discord.js";
import log from "../../utils/log.js";
import Event from "../../models/core/event.js";
import componentWrapper from "../../utils/componentWrapper.js";
import onboarding0 from "../../content/buttons/onboarding0.js";

// turn on word wrap to see the full message

export function welcomeMessage(initCommandId: string) {
  return `Hello, and welcome to Aeonix! This server is primarily for testing my bot, although we have tons of RP mashed in too!

You are currently not able to see any channels other than a few for the onboarding process and the non-player-hangout area. These channels are for setting you up, (such as initializing your persona into the database, the persona being your digital presence with Aeonix) we will also go through the skill system and how other important stats work.

When you have read through the information, please press the button below, and Aeonix will validate your persona's existence in the database, thereafter giving you the <@&1270791621289578607> role.

By pressing 'Begin', you agree to the [Terms of Service](<https://github.com/thorminate/Aeonix/wiki/Terms-of-Service>) and [Privacy Policy](<https://github.com/thorminate/Aeonix/wiki/Privacy-Policy>).

If the Begin button doesn't work (like 'this interaction failed'), you can run </init:${initCommandId}> to refresh the prompt.`;
}

export const welcomeImage = new AttachmentBuilder("./assets/welcome.png", {
  name: "welcome.png",
});

export default new Event<"ready">({
  callback: async ({ aeonix }) => {
    const onboardingChannelId = aeonix.onboardingChannelId;

    if (!onboardingChannelId) {
      log({
        header: "Onboarding channel id not found in aeonix object",
        processName: "OnboardingSupervisor",
        type: "Error",
        payload: {
          "The onboarding channel id: ": onboardingChannelId ?? "undefined",
          "Aeonix: ": aeonix,
        },
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

    const lastMessage = (
      await onboardingChannel.messages
        .fetch({
          limit: 1,
        })
        .catch(() => undefined)
    )?.first();

    if (lastMessage) {
      if (
        (lastMessage.components[1] as TextDisplayComponent).data.content
          .split("\n")
          .join("") ==
        welcomeMessage((await aeonix.commands.get("init"))?.id ?? "")
          .split("\n")
          .join("")
      ) {
        log({
          header: "Onboarding message already sent",
          processName: "OnboardingSupervisor",
          type: "Info",
        });
        return;
      }
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

    await onboardingChannel.send({
      components: [
        new MediaGalleryBuilder().addItems([
          {
            media: {
              url: "attachment://welcome.png",
              content_type: "image/png",
            },
          },
        ]),
        new TextDisplayBuilder().setContent(
          welcomeMessage((await aeonix.commands.get("init"))?.id ?? "")
        ),
        ...componentWrapper(onboarding0.data),
      ],
      flags: MessageFlags.IsComponentsV2,
      files: [welcomeImage],
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

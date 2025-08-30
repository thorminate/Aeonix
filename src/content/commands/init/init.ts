import {
  MediaGalleryBuilder,
  MessageFlags,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";
import {
  welcomeImage,
  welcomeMessage,
} from "../../../events/clientReady/02verifyOnboardingMsg.js";
import log from "../../../utils/log.js";
import deletePlayer from "../../buttons/deletePlayer/deletePlayer.js";
import componentWrapper from "../../../utils/componentWrapper.js";
import onboarding0 from "../../buttons/onboarding0/onboarding0.js";
import Interaction, { ITypes } from "../../../models/core/interaction.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("init")
    .setDescription("Initializes your persona"),

  interactionType: ITypes.Command,
  ephemeral: true,

  callback: async ({ context, aeonix }) => {
    if (await aeonix.players.exists(context.user.id)) {
      const buttons = componentWrapper(deletePlayer.data);

      await context.editReply({
        content:
          "You have already initialized your persona. Do you wish to delete it?",
        components: buttons,
      });
      return;
    }

    await context.editReply({
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
  },

  onError(e) {
    log({
      header: "Error with init command",
      processName: "InitCommand",
      payload: e,
      type: "Error",
    });
  },
});

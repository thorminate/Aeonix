import { ChannelSelectMenuBuilder } from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";
import aeonix from "../../../index.js";

export default new Interaction({
  data: new ChannelSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: InteractionTypes.ChannelSelectMenu,
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template channelSelectMenu executed!",
    });
  },

  onError: (e) => {
    aeonix.logger.error("ChannelSelectMenuTemplate", "Button Error", e);
  },
});

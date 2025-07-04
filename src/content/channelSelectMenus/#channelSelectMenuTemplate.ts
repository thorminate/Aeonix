import { log } from "console";
import { ChannelSelectMenuBuilder } from "discord.js";
import Interaction from "../../models/core/interaction.js";

export default new Interaction({
  data: new ChannelSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: "channelSelectMenu",
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
    log({
      header: "ChannelSelectMenu Error",
      processName: "TemplateChannelSelectMenu",
      payload: e,
      type: "Error",
    });
  },
});

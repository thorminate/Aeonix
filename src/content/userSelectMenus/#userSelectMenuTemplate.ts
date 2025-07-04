import { UserSelectMenuBuilder } from "discord.js";
import Interaction from "../../models/core/interaction.js";
import log from "../../utils/log.js";

export default new Interaction({
  data: new UserSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: "userSelectMenu",
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template userSelectMenu executed!",
    });
  },

  onError: (e) => {
    log({
      header: "UserSelectMenu Error",
      processName: "TemplateUserSelectMenu",
      payload: e,
      type: "Error",
    });
  },
});

import { UserSelectMenuBuilder } from "discord.js";
import Interaction, { ITypes } from "../../models/core/interaction.js";
import log from "../../utils/log.js";

export default new Interaction({
  data: new UserSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: ITypes.UserSelectMenu,
  ephemeral: true,

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

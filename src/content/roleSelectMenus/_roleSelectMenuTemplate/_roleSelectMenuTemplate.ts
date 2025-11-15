import { RoleSelectMenuBuilder } from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";
import log from "../../../utils/log.js";

export default new Interaction({
  data: new RoleSelectMenuBuilder()
    .setCustomId("template")
    .setPlaceholder("Template"),

  interactionType: InteractionTypes.RoleSelectMenu,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template roleSelectMenu executed!",
    });
  },

  onError: (e) => {
    log({
      header: "RoleSelectMenu Error",
      processName: "TemplateRoleSelectMenu",
      payload: e,
      type: "Error",
    });
  },
});

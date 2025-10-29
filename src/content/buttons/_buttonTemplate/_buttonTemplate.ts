import { log } from "console";
import { ButtonStyle } from "discord.js";
import Interaction, {
  ButtonBuilderV2,
  InteractionTypes,
} from "../../../models/core/interaction.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("template") // Should always be the same as the filename
    .setLabel("Template")
    .setStyle(ButtonStyle.Primary),

  interactionType: InteractionTypes.Button,
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    await context.editReply({
      content: "Template button executed!",
    });
  },

  onError: (e) => {
    log({
      header: "Button Error",
      processName: "TemplateButton",
      payload: e,
      type: "Error",
    });
  },
});

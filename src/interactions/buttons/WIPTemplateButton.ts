import { ButtonBuilder, ButtonStyle } from "discord.js";
import Interaction from "../interaction.js";

export default new Interaction({
  data: new ButtonBuilder()
    .setCustomId("WIPTemplateButton")
    .setLabel("WIP")
    .setStyle(ButtonStyle.Primary),

  interactionType: "button",
  customId: "WIPTemplateButton",
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    await context.editReply({
      content: "This button is not yet implemented, wait for future updates!",
    });
  },

  onError: (e) => {
    console.error(e);
  },
});

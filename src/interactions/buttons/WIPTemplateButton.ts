import { ButtonBuilder, ButtonStyle } from "discord.js";
import Interaction from "../interaction.js";

export default new Interaction({
  data: new ButtonBuilder()
    .setCustomId("WIP")
    .setLabel("WIP")
    .setStyle(ButtonStyle.Primary),

  interactionType: "button",
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

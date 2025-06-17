import { ButtonBuilder, ButtonStyle } from "discord.js";
import Button from "../button.js";

export default new Button({
  data: new ButtonBuilder()
    .setCustomId("WIPTemplateButton")
    .setLabel("WIP")
    .setStyle(ButtonStyle.Primary),
  customId: "WIPTemplateButton",
  ephemeral: true,
  acknowledge: true,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async (interaction) => {
    await interaction.editReply({
      content: "This button is not yet implemented, wait for future updates!",
    });
  },

  onError: (e) => {
    console.error(e);
  },
});

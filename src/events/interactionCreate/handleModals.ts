import { Client, ModalSubmitInteraction } from "discord.js";
import Player from "../../models/Player";

export default async (bot: Client, interaction: ModalSubmitInteraction) => {
  if (!interaction.isModalSubmit()) return;

  switch (interaction.customId) {
    case "set-display-name":
      const displayName = interaction.fields.getTextInputValue("display-name");

      const player = await Player.loadOrCreate(interaction.user.username);

      player.username = interaction.user.username;
      player.displayName = displayName;

      await player.save();

      await interaction.reply({ content: "Display name set", ephemeral: true });

      break;
  }
};

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default function generatePageActionRow(
  showArchived: boolean,
  showNotifications: boolean
) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("#toggleArchived")
      .setLabel(showArchived ? "Hide archived" : "Show archived")
      .setStyle(showArchived ? ButtonStyle.Primary : ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("#toggleNotifications")
      .setLabel(showNotifications ? "Hide notifications" : "Show notifications")
      .setStyle(showNotifications ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
}

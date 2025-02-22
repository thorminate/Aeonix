import { ButtonInteraction, Client } from "discord.js";

export default async (bot: Client, buttonInteraction: ButtonInteraction) => {
  if (!buttonInteraction.isButton()) return;
};

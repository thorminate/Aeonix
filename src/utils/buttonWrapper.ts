// Turn an array of buttons into an array of action rows.
import { ActionRowBuilder, ButtonBuilder } from "discord.js"; // Import the discord.js library.

export default (...buttons: ButtonBuilder[]) => {
  const chunks: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length; i += 4) {
    chunks.push(
      new ActionRowBuilder<ButtonBuilder>().setComponents(
        buttons.slice(i, i + 4)
      )
    );
  }

  if (chunks.length === 0) chunks.push(new ActionRowBuilder<ButtonBuilder>());
  if (chunks.length >= 4) throw new Error("Too many buttons, max 16.");
  return chunks;
};

// Turn an array of buttons into an array of action rows.
import { ActionRowBuilder, ButtonBuilder } from "discord.js"; // Import the discord.js library.

export default (buttons: Array<any>) => {
  // Export the function.
  const components = []; // Define components as an array.
  let currentRow = new ActionRowBuilder<ButtonBuilder>(); // Define currentRow as an ActionRowBuilder.

  for (let button of buttons) {
    // Loop through the buttons.
    if (button % 5 === 0 && button > 0) {
      // If the button is divisible by 5 and greater than 0.
      components.push(currentRow); // Push currentRow to components.
      currentRow = new ActionRowBuilder<ButtonBuilder>(); // Set currentRow as an ActionRowBuilder.
    }

    currentRow.addComponents(button); // Add the button to currentRow.
  }

  if (currentRow.components.length > 0) {
    // If currentRow has components.
    components.push(currentRow); // Push currentRow to components.
  }

  return components;
};

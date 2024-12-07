import { ModalSubmitInteraction } from "discord.js";
import itemData from "../../models/ItemData";

interface Options {
  itemName: string;
  itemDescription: string;
  itemActionType: "interact" | "consume" | "use";
}

/**
 * Creates an item in the database.
 * @param {ModalSubmitInteraction} interaction The interaction that ran the command.
 * @param {Options} options The name, description, and action type of the item.
 */
export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { itemName, itemDescription, itemActionType } = options;

  const item = await itemData.findOne({ name: itemName });
  if (item) {
    interaction.reply({
      content: "An item with that name already exists.",
      ephemeral: true,
    });
    return;
  }

  const newItem = new itemData({
    name: itemName,
    description: itemDescription,
    actionType: itemActionType,
  });

  await newItem.save();

  await interaction.reply({
    content: `Successfully created item ${itemName}.`,
    ephemeral: true,
  });
  setTimeout(() => {
    interaction.deleteReply();
  }, 5000);
};

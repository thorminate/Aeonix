import { ModalSubmitInteraction } from "discord.js";
import ItemData from "../../models/ItemData";
import UserData from "../../models/UserData";
import EnvironmentData from "../../models/EnvironmentData";

export default async (
  interaction: ModalSubmitInteraction,
  itemName: string
) => {
  const itemData = await ItemData.findOne({
    name: itemName,
  });

  if (!itemData) {
    await interaction.reply({
      content: "Item not found, make sure it exist in the database",
      ephemeral: true,
    });
    return;
  }
  // Delete the item from people's inventories

  for (const user of itemData.users) {
    const userData = await UserData.findOne({
      id: user,
      guild: interaction.guild.id,
    });
    userData.inventory = userData.inventory.filter(
      (item) => item.itemName !== itemName
    );

    await userData.save();
  }

  // Delete the item from environments
  for (const environment of itemData.environments) {
    const environmentData = await EnvironmentData.findOne({
      name: environment,
    });

    environmentData.items = environmentData.items.filter(
      (item) => item.itemName !== itemName
    );
  }

  // Delete the item from the database.
  await itemData.deleteOne();

  await interaction.reply({
    content: `Successfully deleted item ${itemName}.`,
    ephemeral: true,
  });
};

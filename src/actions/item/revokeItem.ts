import { ModalSubmitInteraction } from "discord.js";
import ItemData from "../../models/ItemData";
import UserData from "../../models/UserData";

interface Options {
  itemName: string;
  targetId: string;
}

/**
 * Revokes an item from a user.
 * @param {ModalSubmitInteraction} interaction The interaction that ran the command.
 * @param {Options} options The name of the item to be revoked and the target user's ID.
 * @returns {Promise<void>}
 */
export default async (
  interaction: ModalSubmitInteraction,
  options: Options
): Promise<void> => {
  const { itemName, targetId } = options;

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

  const targetData = await UserData.findOne({
    id: targetId,
    guild: interaction.guild.id,
  });

  if (!targetData) {
    await interaction.reply({
      content: "User not found, make sure they are in the server.",
      ephemeral: true,
    });
    return;
  }

  if (targetData.inventory.some((item) => item.itemName === itemName)) {
    targetData.inventory = targetData.inventory.filter(
      (item) => item.itemName !== itemName
    );
    itemData.users = itemData.users.filter((user) => user !== targetId);
    await targetData.save();
    await itemData.save();

    await interaction.reply({
      content: `Successfully removed item ${
        itemName[0].toUpperCase() + itemName.slice(1)
      } from <@${targetId}>'s inventory.`,
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content: "User does not have the item in their inventory.",
      ephemeral: true,
    });
    return;
  }
};

import { ModalSubmitInteraction } from "discord.js";
import EnvironmentData from "../../models/environmentDatabaseSchema";
import ItemData from "../../models/itemDatabaseSchema";

interface Options {
  name: string;
  operator: "add" | "remove" | "set";
  items: string[];
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { name, operator, items } = options;

  // Validate environment's existence.
  const environmentData = await EnvironmentData.findOne({
    name,
  });

  if (!environmentData) {
    await interaction.reply({
      content: "Environment not found!",
      ephemeral: true,
    });
    return;
  }

  // get items
  const itemDatas: Array<Document | string> = (await Promise.all(
    items.map(async (itemName: string) => {
      // for each item
      const item = await ItemData.findOne({ name: itemName }); // get their corresponding data
      if (!item) return itemName;
      else return item;
    })
  )) as Array<Document | string>;
  const invalidItems = itemDatas.filter(
    // filter out valid items into new array
    (item) => !item
  );
  if (invalidItems.length > 0) {
    // if there are invalid items
    await interaction.reply({
      // say so verbosely
      content: `Items ${invalidItems
        .map((item, index) => items[index])
        .join(", ")} not found, make sure they exist in the database.`,
      ephemeral: true,
    });
    return;
  }
  switch (operator) {
    case "add":
      if (
        environmentData.items.includes(itemDatas.map((item: any) => item.name))
      ) {
        await interaction.reply({
          content: `Items ${itemDatas
            .map((item: any) => item.name)
            .join(", ")} already in environment ${name}.`,
          ephemeral: true,
        });
        return;
      }
      environmentData.items.push(
        ...itemDatas.map((item: any) => item.itemName)
      );

      await environmentData.save();
      await interaction.reply({
        content: `Successfully added item(s) ${itemDatas
          .map((item: any) => item.itemName)
          .join(", ")} to environment ${name}.`,
        ephemeral: true,
      });
      break;

    case "remove":
      environmentData.items = environmentData.items.filter(
        (itemName: string) =>
          !itemDatas.some((item: any) => item.itemName === itemName)
      );
      await environmentData.save();
      await interaction.reply({
        content: `Successfully removed items in environment ${name} to ${itemDatas
          .map((item: any) => item.itemName)
          .join(", ")}.`,
        ephemeral: true,
      });
      break;

    case "set":
      environmentData.items = itemDatas.map((item: any) => item.itemName);

      await environmentData.save();
      await interaction.reply({
        content: `Successfully set items in environment ${name} to ${itemDatas
          .map((item: any) => item.itemName)
          .join(", ")}.`,
        ephemeral: true,
      });
      break;
  }
};

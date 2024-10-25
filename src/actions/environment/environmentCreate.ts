import { ModalSubmitInteraction } from "discord.js";
import ItemData from "../../models/itemDatabaseSchema";
import EnvironmentData from "../../models/environmentDatabaseSchema";
import log from "../../utils/log";

interface Options {
  name: string;
  items: string[];
  channel: string;
}

/**
 * Create an environment.
 * @param interaction The interaction that triggered the action.
 * @param options The name, items and channel of the environment.
 */
export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  try {
    const { name, items, channel } = options;

    const itemsData = await Promise.all(
      items.map(async (itemName: string) => {
        // for each item
        if (itemName === "none") return itemName;
        const item: Document = await ItemData.findOne({ name: itemName }); // get their corresponding data
        return [item, itemName]; // return the item object into the new array
      })
    );

    if (!interaction.guild.channels.cache.has(channel)) {
      // if channel id is not a number
      await interaction.reply({
        // say so verbosely
        content: "Channel ID invalid!",
        ephemeral: true,
      });
      return;
    }
    if (
      await EnvironmentData.findOne({
        name: name,
      })
    ) {
      // if environment already exists
      await interaction.reply({
        // say so verbosely
        content: `Environment ${name} already exists.`,
        ephemeral: true,
      });
      return;
    }

    if (!itemsData.includes("none")) {
      // Check if all items exist
      const invalidItems = itemsData.filter(
        // filter out valid items into new array
        (item) => !item[0]
      );
      if (invalidItems.length > 0) {
        // if there are invalid items
        await interaction.reply({
          // say so verbosely
          content: `Item(s) ${invalidItems
            .map((item: null, index: number) => itemsData[index][0])
            .join(", ")} not found, make sure they exist in the database.`,
          ephemeral: true,
        });
        return;
      }
      // give all items the environment name
      itemsData.forEach(async (item: any) => {
        // for each existing item
        item[0].itemEnvironments.push(name);
        item[0].save();
      });
      // create environment
      const createEnvironment = new EnvironmentData({
        name: name,
        items: itemsData.map((item: Array<Document | string>) => item[1]),
        channel: channel,
      });
      await createEnvironment.save();
      await interaction.reply({
        content: `Successfully created environment ${name}.\nWith item(s): ${items
          .map((item: any) => {
            if (!item) return "none";
            else return item[1];
          })
          .join(", ")}. \nAnd channel: <#${channel}>`,
        ephemeral: true,
      });
    } else {
      // create environment
      const createEnvironment = new EnvironmentData({
        name: name,
        items: [],
        channel: channel,
      });
      await createEnvironment.save();
      await interaction.reply({
        content: `Successfully created environment ${name}.\nWith no items. \nAnd channel: <#${channel}>`,
        ephemeral: true,
      });
    }
  } catch (err) {
    console.log(err);
    log({
      header: "Environment Create Error",
      payload: `${err}`,
      type: "error",
    });
  }
};

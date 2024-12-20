import { ModalSubmitInteraction } from "discord.js";
import ItemData from "../../models/ItemData";
import EnvironmentData from "../../models/EnvironmentData";
import {
  ChannelNotFoundError,
  EnvironmentAlreadyExistsError,
  EnvironmentCreationError,
  ItemNotFoundError,
} from "../../errors";
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

    //region Validation
    //Channel validation
    if (!interaction.guild.channels.cache.has(channel)) {
      // if channel id is not a number
      throw new ChannelNotFoundError(
        "Channel not found!",
        "interaction.guild.channels.cache.has(channel) returned false while creating environment."
      );
    }

    //Environment validation
    if (
      await EnvironmentData.findOne({
        name: name,
      })
    ) {
      // if environment already exists
      throw new EnvironmentAlreadyExistsError(
        `Environment ${name} already exists.`,
        `await EnvironmentData.findOne({
        name: ${name},
      }) returned true while creating environment.`
      );
    }

    //Item validation
    const __itemsData: Array<Array<Document | string> | string> =
      await Promise.all(
        items.map(async (itemName: string) => {
          // for each item
          if (itemName === "none") return itemName;
          const item: Document = await ItemData.findOne({ name: itemName }); // get their corresponding data
          if (!item) {
            return [null, itemName]; // return null if item doesn't exist
          }
          return [item, itemName]; // return the item object into the new array
        })
      );
    let itemsData: Array<Array<Document | string>> | string;
    if (__itemsData.includes("none")) {
      itemsData = "none";
    } else {
      itemsData = __itemsData as Array<Array<Document | string>>;
    }

    if (itemsData !== "none" && typeof itemsData !== "string") {
      // if item is not none then check if all items exist
      const invalidItems = itemsData.filter(
        // filter out valid items into new array
        (item) => !item[0]
      );
      if (invalidItems.length > 0) {
        // if there are invalid items
        throw new ItemNotFoundError(
          `Item(s) ${invalidItems} did not exist while creating environment.`,
          `await ItemData.findOne({ name: ${itemsData.map(
            (item) => item[1]
          )} }) returned false while creating environment.`
        );
      }
      // give all valid items the environment name
      itemsData.forEach(async (item: any) => {
        // for each existing item
        item[0].itemEnvironments.push(name);
        item[0].save();
      });
      // create environment with valid items
      const createEnvironment = new EnvironmentData({
        name,
        items: itemsData.map((item: Array<Document | string>) => item[1]),
        channel,
      });
      await createEnvironment.save();
      await interaction.reply({
        content: `Successfully created environment ${name}.\nWith item(s): ${itemsData
          .map((item: Array<Document | string>) => item[1])
          .join(", ")}. \nAnd channel: <#${channel}>`,
        ephemeral: true,
      });
    } else {
      // if there are no items
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
    log({
      header: "Environment Creation Error",
      payload: `${err}`,
      type: "error",
    });
    throw new EnvironmentCreationError(`${err}`, `while creating environment.`);
  }
};

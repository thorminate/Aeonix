import { Event } from "../../handlers/eventHandler.js";
import WeaponItem, {
  IWeaponData,
} from "../../models/item/content/WeaponItem.js";
import Item from "../../models/item/item.js";
import Player from "../../models/player/Player.js";
import log from "../../utils/log.js";

export default async (event: Event) => {
  try {
    log({
      header: "Running tests",
      type: "Info",
    });

    const player = new Player(event.bot.user, event.bot.user.username);

    const item: WeaponItem = await Item.find("WeaponItem");

    const item2: WeaponItem = await item.toInventoryEntry().toItem();

    let test = true;

    // #region Item conversion

    if (item.name !== item2.name) {
      log({
        header: "Test Error, name should be the same",
        payload: `${item.name} !== ${item2.name}`,
        type: "Error",
      });
      test = false;
    }

    if (item.data.damage !== item2.data.damage) {
      log({
        header: "Test Error, capacity should be the same",
        payload: `${item.data.damage} !== ${item2.data.damage}`,
        type: "Error",
      });
      test = false;
    } else if (item.id !== item2.id) {
      log({
        header: "Test Error, id should be the same",
        payload: `${item.id} !== ${item2.id}`,
        type: "Error",
      });
      test = false;
    }
    // #region Inventory mutability

    player.inventory.clear();

    player.inventory.add(item.toInventoryEntry());

    if (player.inventory.entries.length !== 1) {
      log({
        header: "Test Error, inventory should have 1 item",
        payload: player.inventory,
        type: "Error",
      });
      test = false;
    } else if (player.inventory.entries[0]?.quantity !== 1) {
      log({
        header: "Test Error, quantity should be 1",
        payload: `${player.inventory.entries[0].quantity} !== 1`,
        type: "Error",
      });
      test = false;
    }

    log({
      header: test ? "Tests passed" : "A test failed, check logs",
    });
  } catch (error) {
    log({
      header: "Test Error",
      payload: error,
      type: "Error",
    });
  }
};

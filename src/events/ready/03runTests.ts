import Event, { EventParams } from "../../models/core/event.js";
import BackpackItem from "../../models/item/content/BackpackItem.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";

export default new Event({
  callback: async (event: EventParams) => {
    if (!event.aeonix.user) {
      log({
        header: "User is falsy",
        processName: "TestRunner",
        payload: event.aeonix.user,
        type: "Error",
      });
      return;
    }

    const player = new Player(event.aeonix.user, event.aeonix.user.username);

    const item = new BackpackItem();
    const item2 = (await item.toInventoryEntry().toItem()) as BackpackItem;

    let test = true;

    // #region Item conversion

    if (item.name !== item2.name) {
      log({
        header: "Test Error, name should be the same",
        processName: "TestRunner",
        payload: `${item.name} !== ${item2.name}`,
        type: "Error",
      });
      test = false;
    }

    if (item.data.capacity !== item2.data.capacity) {
      log({
        header: "Test Error, damage should be the same",
        processName: "TestRunner",
        payload: `${item.data.entries} !== ${item2.data.entries}`,
        type: "Error",
      });
      test = false;
    } else if (item.id !== item2.id) {
      log({
        header: "Test Error, id should be the same",
        processName: "TestRunner",
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
        processName: "TestRunner",
        payload: player.inventory,
        type: "Error",
      });
      test = false;
    } else if (player.inventory.entries[0]?.quantity !== 1) {
      log({
        header: "Test Error, quantity should be 1",
        processName: "TestRunner",
        payload: `${player.inventory.entries[0]?.quantity} !== 1`,
        type: "Error",
      });
      test = false;
    }

    log({
      header: test ? "Tests passed" : "A test failed, check logs",
      processName: "TestRunner",
      type: test ? "Info" : "Error",
    });
  },
  onError: async (e) => {
    log({
      header: "Error running tests",
      processName: "TestRunner",
      payload: e,
      type: "Error",
    });
  },
});

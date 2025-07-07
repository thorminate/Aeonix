import BackpackItem from "../../content/items/backpackItem.js";
import Event from "../../models/core/event.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";

export default new Event<"ready">({
  callback: async ({ aeonix }) => {
    if (!aeonix.user) {
      log({
        header: "User is falsy",
        processName: "TestRunner",
        payload: aeonix.user,
        type: "Error",
      });
      return;
    }

    const player = new Player(aeonix.user, aeonix.user.username);

    const item = new BackpackItem();

    let test = true;

    // #region Inventory

    player.inventory.clear();

    player.inventory.add(item);

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

    // #region Environment

    const startEnvironment = await aeonix.environments.cache.get("start");

    if (!startEnvironment) {
      log({
        header: "Test Error, start environment is falsy",
        processName: "TestRunner",
        payload: aeonix.environments.cache,
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

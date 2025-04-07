import Event, { EventParams } from "../../models/Core/Event.js";
import WeaponItem, {
  IWeaponData,
} from "../../models/Game/Item/content/WeaponItem.js";
import Item from "../../models/Game/Item/item.js";
import Player from "../../models/Game/Player/Player.js";
import log from "../../utils/log.js";

export default new Event({
  callback: async (event: EventParams) => {
    const player = new Player(event.aeonix.user, event.aeonix.user.username);

    const item: WeaponItem = await Item.find("WeaponItem");
    const item2: WeaponItem = await item.toInventoryEntry().toItem();

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

    if (item.data.damage !== item2.data.damage) {
      log({
        header: "Test Error, capacity should be the same",
        processName: "TestRunner",
        payload: `${item.data.damage} !== ${item2.data.damage}`,
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
        payload: `${player.inventory.entries[0].quantity} !== 1`,
        type: "Error",
      });
      test = false;
    }

    const thor = await Player.find("thorminate");

    thor.inventory.clear();
    thor.inventory.add(item.toInventoryEntry());
    thor.save();

    log({
      header: test ? "Tests passed" : "A test failed, check logs",
      processName: "TestRunner",
      type: test ? "Info" : "Error",
    });
  },
  onError: async (e: any) => {
    log({
      header: "Error running tests",
      processName: "TestRunner",
      payload: e,
      type: "Error",
    });
  },
});

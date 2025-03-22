import { ButtonInteraction, MessageFlags } from "discord.js";
import Player from "../../models/player/Player.js";
import Button from "../button.js";
import Item from "../../models/item/item.js";
import log from "../../utils/log.js";
import { IWeaponData } from "../../models/item/content/WeaponItem.js";

export default <Button>{
  customId: "test",
  passPlayer: true,
  callback: async (buttonContext: ButtonInteraction, player: Player) => {
    const item = await Item.find("WeaponItem");

    const item2 = await item.toInventoryEntry().toItem();

    let test = true;

    // #region Item conversion

    if (item.name !== item2.name) {
      log({
        header: "Test Error, name should be the same",
        payload: `${item.name} !== ${item2.name}`,
        type: "Error",
      });
      test = false;
    } else if (
      (item.data as IWeaponData).damage !== (item2.data as IWeaponData).damage
    ) {
      log({
        header: "Test Error, capacity should be the same",
        payload: `${item.data.capacity} !== ${item2.data.capacity}`,
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

    await buttonContext.reply({
      content: test ? "Test passed" : "Test failed, check logs",
      flags: MessageFlags.Ephemeral,
    });
  },
  onError(error) {
    log({
      header: "Test Error",
      payload: error,
      type: "Error",
    });
  },
};

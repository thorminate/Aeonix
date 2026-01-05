import Player from "#player/player.js";
import Item from "#item/item.js";

export default class ItemEventContext {
  player: Player;
  item: Item;

  constructor(player: Player, item: Item) {
    this.player = player;
    this.item = item;
  }
}

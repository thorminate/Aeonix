import Player from "../../player/utils/player.js";
import Item from "../item.js";

export default class ItemEventContext {
  player: Player;
  item: Item;

  constructor(player: Player, item: Item) {
    this.player = player;
    this.item = item;
  }
}

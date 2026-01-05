import Item from "#item/item.js";
import Player from "#player/player.js";

interface ExtraContext {
  item?: Item;
}

export default class EnvironmentEventContext {
  eventType: string = "base";
  player: Player;
  item?: Item;

  constructor(eventType: string, player: Player, opts?: ExtraContext) {
    this.eventType = eventType;
    this.player = player;
    this.item = opts?.item;
  }
}

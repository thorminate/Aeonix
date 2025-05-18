import ItemReference from "../../item/utils/itemReference.js";
import Player from "../../player/player.js";

interface ExtraContext {
  item?: ItemReference;
}

export default class EnvironmentEventContext {
  eventType: string = "base";
  player: Player;
  item?: ItemReference;

  constructor(eventType: string, player: Player, opts?: ExtraContext) {
    this.eventType = eventType;
    this.player = player;
    this.item = opts?.item;
  }
}

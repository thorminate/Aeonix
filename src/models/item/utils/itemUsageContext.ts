import Player from "../../player/player.js";

export default class ItemUsageContext {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }
}

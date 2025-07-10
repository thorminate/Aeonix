import Player from "../../player/utils/player.js";

export default class ItemUsageContext {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }
}

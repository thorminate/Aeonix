import PlayerRef from "../../player/utils/types/playerRef.js";

export default class ItemUsageContext {
  player: PlayerRef;

  constructor(player: PlayerRef) {
    this.player = player;
  }
}

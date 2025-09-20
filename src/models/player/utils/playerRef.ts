import { log } from "console";
import aeonix from "../../../index.js";
import Player from "../player.js";

export default class PlayerRef {
  private weak?: WeakRef<Player>;

  constructor(private id: string, previousResolution?: Player) {
    if (previousResolution) this.weak = new WeakRef(previousResolution);
  }

  get idString() {
    return this.id;
  }

  async use<T>(fn: (player: Player) => Promise<T>): Promise<T | undefined> {
    if (aeonix.players.isDeleted(this.id)) return;

    let player = this.weak?.deref();
    if (!player) {
      player = await aeonix.players.load(this.id);
      if (!player) return;

      this.weak = new WeakRef(player);
    } else {
      aeonix.players.set(player);
    }

    player.lastAccessed = Date.now();

    const result = await fn(player).catch((err) => {
      log({
        header: "PlayerRef.use",
        payload: err,
        type: "Error",
      });
      throw err;
    });
    player = undefined;
    return result;
  }
}

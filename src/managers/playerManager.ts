import CachedManager from "../models/core/cachedManager.js";
import Player, { playerModel } from "../models/player/utils/player.js";
import hardMerge from "../utils/hardMerge.js";

export default class PlayerManager extends CachedManager<Player> {
  async load(id: string): Promise<Player | undefined> {
    const doc = await playerModel.findById(id);
    if (!doc) return undefined;

    const player = new Player();
    const instance = hardMerge(player, doc.toObject(), player.getClassMap());

    this.set(instance._id, instance);
    return instance;
  }

  async loadAll(noDuplicates: boolean = false): Promise<Player[]> {
    const allDocs = await playerModel.find({});
    if (allDocs.length === 0) return [];

    const total: Player[] = [];
    for (const doc of allDocs) {
      if (noDuplicates && this.exists(doc._id)) continue;

      const player = new Player();
      const instance = hardMerge(player, doc.toObject(), player.getClassMap());

      total.push(instance);
      this.set(doc._id, instance);
    }

    return total;
  }
}

import aeonix from "../../../../index.js";
import Player from "../player.js";

type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

export default class PlayerRef {
  constructor(private _id: string) {
    this._id = _id;
  }

  get id() {
    return this._id;
  }

  async use<T>(fn: (player: Player) => Promise<T>): Promise<T | undefined> {
    const player = await aeonix.players.get(this.id);
    if (!player) return undefined;
    const result = await fn(player);
    return result;
  }

  async view(): Promise<DeepReadonly<Player> | undefined> {
    const player = await aeonix.players.get(this.id);
    if (!player) return;
    return player as DeepReadonly<Player>;
  }
}

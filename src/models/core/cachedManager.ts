import { Collection } from "discord.js";
import BaseManager from "./baseManager.js";

export default abstract class CachedManager<
  Holds,
  HasAeonix = true
> extends BaseManager<HasAeonix> {
  private _cache: Collection<string, Holds> = new Collection<string, Holds>();

  get cache() {
    return this._cache;
  }

  abstract load(id: string): Promise<Holds | undefined>;
  abstract loadAll(noDuplicates: boolean): Promise<Holds[]>;
}

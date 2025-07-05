import { Collection } from "discord.js";

export default abstract class CachedManager<Holds> {
  private _cache: Collection<string, Holds> = new Collection<string, Holds>();

  get cache() {
    return this._cache;
  }

  abstract load(id: string): Promise<Holds | undefined>;
  abstract loadAll(noDuplicates: boolean): Promise<Holds[]>;
}

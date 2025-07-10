import { Collection } from "discord.js";
import BaseManager from "./baseManager.js";

export default abstract class CachedManager<Holds> extends BaseManager {
  private _cache: Collection<string, Holds> = new Collection<string, Holds>();

  abstract load(id: string): Promise<Holds | undefined>;
  async get(id: string, noCache = false) {
    return noCache
      ? await this.load(id)
      : this._cache.get(id) ?? (await this.load(id));
  }

  abstract loadAll(noDuplicates: boolean): Promise<Holds[]>;
  async getAll(noCache = false) {
    const data = Array.from(this._cache.values());
    return data.length > 0 && !noCache ? data : await this.loadAll(true);
  }

  exists(id: string) {
    return this._cache.has(id);
  }

  delete(id: string) {
    this._cache.delete(id);
  }

  set(id: string, data: Holds) {
    this._cache.set(id, data);
  }

  array() {
    return Array.from(this._cache.values());
  }
}

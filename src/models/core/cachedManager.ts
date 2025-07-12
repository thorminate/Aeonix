import { Collection } from "discord.js";
import BaseManager from "./baseManager.js";

export default abstract class CachedManager<Holds> extends BaseManager {
  private _cache: Collection<string, Holds> = new Collection<string, Holds>();

  protected _ready = false;

  isReady() {
    return this._ready;
  }

  abstract load(id: string): Promise<Holds | undefined>;
  async get(id: string, noCache = false) {
    await this.waitUntilReady();
    if (noCache) {
      return this.load(id);
    } else {
      return this._cache.get(id);
    }
  }

  abstract loadAll(noDuplicates: boolean): Promise<Holds[]>;
  async getAll(noCache = false) {
    await this.waitUntilReady();

    const data = Array.from(this._cache.values());
    return data.length > 0 && !noCache ? data : this.loadAll(noCache);
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

  async waitUntilReady() {
    if (!this._ready) {
      return new Promise<void>((resolve) => {
        this.once("ready", () => {
          resolve();
        });
      });
    } else {
      return Promise.resolve();
    }
  }
}

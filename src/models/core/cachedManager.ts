import { Collection } from "discord.js";
import BaseManager from "./baseManager.js";

export default abstract class CachedManager<
  Holds,
  Key = string
> extends BaseManager {
  private _cache: Collection<Key, Holds> = new Collection<Key, Holds>();
  protected _ready = false;
  abstract getKey(instance: Holds): Key;
  onAccess?(instance: Holds): void;

  abstract load(id: Key): Promise<Holds | undefined>;
  async get(id: Key, runOnAccess = true) {
    await this.waitUntilReady();

    let instance = this._cache.get(id);
    if (!instance) instance = await this.load(id);

    if (!instance) return;

    if (runOnAccess) this.onAccess?.(instance);
    return instance;
  }
  async refresh(id: Key) {
    const instance = await this.load(id);
    if (instance) {
      this.set(instance);
      this.onAccess?.(instance);
    }
    return instance;
  }

  abstract loadAll(noDuplicates?: boolean): Promise<Holds[]>;
  async getAll(runOnAccess = true) {
    await this.waitUntilReady();
    const instances = this.array();
    if (runOnAccess) instances.forEach((instance) => this.onAccess?.(instance));
    return instances;
  }
  async refreshAll(noDuplicates?: boolean) {
    const instances = await this.loadAll(noDuplicates);
    instances.forEach((instance) => {
      this.set(instance);
      this.onAccess?.(instance);
    });
    return instances;
  }

  exists(id: Key) {
    return this._cache.has(id);
  }

  release(id: Key) {
    this._cache.delete(id);
  }

  set(data: Holds) {
    const key = this.getKey(data);
    this._cache.set(key, data);
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
    }
  }
}

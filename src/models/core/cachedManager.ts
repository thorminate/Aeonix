import { Collection } from "discord.js";
import BaseManager from "./baseManager.js";

export default abstract class CachedManager<
  Holds,
  Key = string
> extends BaseManager {
  protected _cache: Collection<Key, Holds> = new Collection<Key, Holds>();
  protected _ready = false;
  abstract getKey(instance: Holds): Key;
  onAccess?(instance: Holds): void;

  abstract load(id: Key): Promise<Holds | undefined>;
  async get(id: Key, runOnAccess = true) {
    await this.waitUntilReady();

    let instance = this._cache.get(id);
    if (!instance) {
      instance = await this.load(id);
      if (!instance) return;
    }

    this.set(instance);

    if (runOnAccess) this.onAccess?.(instance);
    return instance;
  }
  async prefetch(id: Key) {
    const instance = await this.load(id);
    if (!instance) return;
    this.set(instance);
  }

  abstract loadAll(noDuplicates?: boolean): Promise<Holds[]>;
  async getAll(runOnAccess = true) {
    await this.waitUntilReady();
    const instances = this.array();
    if (runOnAccess) instances.forEach((instance) => this.onAccess?.(instance));
    return instances;
  }
  async prefetchMultiple(ids: Key[]) {
    const instances = await Promise.all(ids.map((id) => this.load(id)));
    instances.forEach((instance) => {
      if (instance) this.set(instance);
    });
  }

  has(id: Key) {
    return this._cache.has(id);
  }

  async exists(id: Key) {
    if (this._cache.has(id)) return true;
    else if (await this.load(id)) return true;
    else return false;
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

  markReady() {
    if (!this._ready) {
      this._ready = true;
      this.emit("ready");
    }
  }
}

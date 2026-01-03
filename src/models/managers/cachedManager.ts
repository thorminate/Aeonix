import BaseManager from "./baseManager.js";

export default abstract class CachedManager<
  Holds,
  Key = string
> extends BaseManager {
  protected _cache: Map<Key, Holds> = new Map<Key, Holds>();
  protected _ready = false;
  protected abstract getKey(instance: Holds): Key;
  protected onAccess?(instance: Holds): Promise<void>;

  abstract load(id: Key): Promise<Holds | undefined>;
  async get(id: Key, runOnAccess = true) {
    await this.waitUntilReady();

    let instance = this._cache.get(id);
    if (!instance) {
      instance = await this.load(id);
      if (!instance) return;
      runOnAccess = false;
    }

    this.set(instance);

    if (runOnAccess) this.onAccess?.(instance);
    return instance;
  }

  abstract loadAll(noDuplicates?: boolean): Promise<Holds[]>;
  async getAll(runOnAccess = true) {
    await this.waitUntilReady();
    const instances = this.array();
    if (runOnAccess) instances.forEach((instance) => this.onAccess?.(instance));
    return instances;
  }

  empty() {
    this._cache.clear();
  }
  has(id: Key) {
    return this._cache.has(id);
  }
  release(id: Key) {
    this._cache.delete(id);
  }
  set(data: Holds) {
    this._cache.set(this.getKey(data), data);
  }
  array() {
    return Array.from(this._cache.values());
  }
  protected abstract _existsSlow(id: Key): Promise<boolean>;
  async exists(id: Key) {
    if (this._cache.has(id)) return true;
    else {
      return this._existsSlow(id);
    }
  }

  markReady() {
    if (!this._ready) {
      this._ready = true;
      this.emit("ready");
    }
  }
  protected async waitUntilReady() {
    if (!this._ready) {
      return new Promise<void>((resolve) => {
        this.once("ready", () => {
          resolve();
        });
      });
    }
  }
}

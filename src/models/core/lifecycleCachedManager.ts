import CachedManager from "./cachedManager.js";
import { Collection } from "discord.js";

export default abstract class LifecycleCachedManager<
  T extends object
> extends CachedManager<T> {
  _weakRefs: Collection<string, WeakRef<T>> = new Collection<
    string,
    WeakRef<T>
  >();
  _gcCollected: Set<string> = new Set<string>();
  _finalizationRegistry = new FinalizationRegistry((id: string) => {
    this._gcCollected.add(id);
    const weak = this._weakRefs.get(id);
    if (!weak?.deref()) this._weakRefs.delete(id);
  });

  override async get(id: string): Promise<T | undefined> {
    await this.waitUntilReady();

    let instance = this._cache.get(id);
    if (instance) {
      this.onAccess?.(instance);
      return instance;
    }

    const revived = this._weakRefs.get(id)?.deref();
    if (revived) {
      this.set(revived);
      this.onAccess?.(revived);
      return revived;
    }

    instance = await this.load(id);
    if (instance) {
      this.onAccess?.(instance);
      this.set(instance);
      this._weakRefs.set(id, new WeakRef(instance));
      this._finalizationRegistry.register(instance, id);
    }

    return instance;
  }
}

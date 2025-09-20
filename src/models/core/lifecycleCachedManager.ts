import { Model } from "mongoose";
import CachedManager from "./cachedManager.js";
import { Collection } from "discord.js";

export default abstract class LifecycleCachedManager<
  Holds extends {
    _id: string;
    getClassMap(): Record<string, new (...args: unknown[]) => unknown>;
  },
  DB extends {
    _id: string;
  }
> extends CachedManager<Holds> {
  _deletedIds: Set<string> = new Set<string>();
  _weakRefs: Collection<string, WeakRef<Holds>> = new Collection<
    string,
    WeakRef<Holds>
  >();
  _gcCollected: Set<string> = new Set<string>();
  _finalizationRegistry = new FinalizationRegistry((id: string) => {
    this._gcCollected.add(id);
    const weak = this._weakRefs.get(id);
    if (!weak?.deref()) this._weakRefs.delete(id);
  });

  abstract model(): Model<DB>;
  abstract inst(): Holds;
  abstract onLoad(instance: DB): Promise<Holds>;
  abstract onSave(instance: Holds): Promise<DB>;

  markDeleted(id: string) {
    this._deletedIds.add(id);
  }

  markCreated(id: string) {
    this._deletedIds.delete(id);
  }

  isDeleted(id: string) {
    return this._deletedIds.has(id);
  }

  override async get(id: string): Promise<Holds | undefined> {
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
  async load(id: string): Promise<Holds | undefined> {
    const raw = (await this.model().findById(id).lean()) as DB | undefined;
    if (!raw) return undefined;

    const instance = await this.onLoad(raw);

    this.set(instance);
    return instance;
  }
  async preload(id: string) {
    await this.get(id);
  }

  async loadAll(noDuplicates = false): Promise<Holds[]> {
    const allDocs = await this.model().find({}).lean();
    if (!allDocs || !allDocs.length || allDocs.length === 0) return [];

    const total: Holds[] = [];
    const batchSize = 100;
    for (let i = 0; i < allDocs.length; i += batchSize) {
      const batch = allDocs.slice(i, i + batchSize);

      const batchPromises = batch.map(async (doc) => {
        if (noDuplicates && (await this.exists(doc._id))) return null;
        if (this._cache.has(doc._id)) {
          const cached = this._cache.get(doc._id)!;
          this.onAccess?.(cached);
          return cached;
        }

        const instance = await this.onLoad(doc as DB);
        return instance;
      });

      const batchResults = await Promise.all(batchPromises);

      for (const instance of batchResults) {
        if (instance) {
          this.set(instance);
          total.push(instance);
        }
      }
    }

    this.markReady();
    return total;
  }

  protected override async _existsSlow(id: string): Promise<boolean> {
    return !!(await this.model().findById({ _id: id }).lean());
  }
}

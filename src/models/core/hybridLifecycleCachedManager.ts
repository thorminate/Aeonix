import LifecycleCachedManager from "./lifecycleCachedManager.js";
import getAllFiles from "../../utils/getAllFiles.js";
import path from "path";
import url from "url";
import merge from "../../utils/merge.js";
import ConcreteConstructor from "./concreteConstructor.js";

export default abstract class HybridLifecycleCachedManager<
  T extends {
    type: string;
    _id: string;
    getClassMap(): Record<string, new (...args: unknown[]) => unknown>;
  }
> extends LifecycleCachedManager<T> {
  abstract folder(): string;

  async loadRawClass(id: string): Promise<ConcreteConstructor<T> | undefined> {
    const folders = await getAllFiles(this.folder(), true);
    const folderPath = folders.find((f) => f.includes(id));
    if (!folderPath) return;

    const filePath = path.resolve(folderPath, `${id}.js`);
    const fileUrl = url.pathToFileURL(filePath);
    return (await import(fileUrl.toString())).default as ConcreteConstructor<T>;
  }

  async instFromId(id: string): Promise<T | undefined> {
    const RawClass = await this.loadRawClass(id);
    if (!RawClass) return;
    return new RawClass() as T;
  }

  override async load(id: string): Promise<T | undefined> {
    const emptyInst = await this.instFromId(id);
    if (!emptyInst) return undefined;

    let rawDoc = (await this.model()
      .find({ type: id })
      .lean()) as unknown as Partial<T>;
    if (!rawDoc) {
      const createdDoc = await this.model().create(emptyInst);
      rawDoc = createdDoc.toObject();
    }

    emptyInst._id = rawDoc._id!;

    const instance = merge(emptyInst, rawDoc, emptyInst.getClassMap());
    await this.onLoad(instance);
    this.set(instance);

    // Also store in weakRefs for revival
    this._weakRefs.set(id, new WeakRef(instance));
    this._finalizationRegistry.register(instance, id);

    return instance;
  }

  override async loadAll(noDuplicates = false): Promise<T[]> {
    const allFiles = await getAllFiles(this.folder(), true);
    const allIds = allFiles.map((f) => path.basename(f));

    const dbDocs = (await this.model()
      .find({ type: { $in: allIds } })
      .lean()) as Partial<T>[];
    const dbMap = new Map(dbDocs.map((d) => [d.type, d]));

    const total: T[] = [];

    for (const id of allIds) {
      if (noDuplicates && (await this.exists(id))) continue;
      if (this.has(id)) {
        const cached = (await this.get(id))!;
        this.onAccess?.(cached);
        total.push(cached);
        continue;
      }

      const emptyInst = await this.instFromId(id);
      if (!emptyInst) continue;

      let doc = dbMap.get(id);
      if (!doc) {
        doc = (await this.model().create(emptyInst)).toObject();
      }

      const instance = merge(emptyInst, doc, emptyInst.getClassMap());
      await this.onLoad(instance);

      this.set(instance);
      total.push(instance);
    }

    this.markReady();
    return total;
  }

  protected override async _existsSlow(id: string): Promise<boolean> {
    return !!(await this.model().exists({ _id: id }).lean());
  }
}

import getAllFiles from "../../utils/getAllFiles.js";
import path from "path";
import url from "url";
import merge from "../../utils/merge.js";
import ConcreteConstructor from "./concreteConstructor.js";
import { Model } from "mongoose";
import CachedManager from "./cachedManager.js";

export default abstract class HybridCachedManager<
  Holds extends {
    type: string;
    _id: string;
    getClassMap(): Record<string, new (...args: unknown[]) => unknown>;
  },
  DbData extends {
    type: string;
    _id: string;
  }
> extends CachedManager<Holds> {
  abstract folder(): string;
  abstract model(): Model<DbData>;
  abstract fixInst(inst: Holds): DbData;

  protected pathCache: Map<string, string> = new Map();
  protected pathsLoaded = false;

  protected async ensurePathsLoaded() {
    if (this.pathsLoaded) return;

    const folders = await getAllFiles(this.folder(), true);

    for (const folder of folders) {
      const folderName = path.basename(folder);
      const filePath = path.resolve(folder, folderName + ".js");
      this.pathCache.set(folderName, filePath);
    }

    this.pathsLoaded = true;
  }

  protected async loadRawClass(
    id: string
  ): Promise<ConcreteConstructor<Holds> | undefined> {
    await this.ensurePathsLoaded();
    const filePath = this.pathCache.get(id);
    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    return (await import(fileUrl.toString()))
      .default as ConcreteConstructor<Holds>;
  }

  protected async instFromId(id: string): Promise<Holds | undefined> {
    const RawClass = await this.loadRawClass(id);
    if (!RawClass) return;
    return new RawClass() as Holds;
  }

  async load(id: string): Promise<Holds | undefined> {
    const emptyInst = await this.instFromId(id);
    if (!emptyInst) return undefined;

    let rawDoc = (await this.model()
      .findOne({ type: id })
      .lean()) as unknown as DbData;
    if (!rawDoc) {
      rawDoc = (await this.model().create(this.fixInst(emptyInst))).toObject();
    }

    emptyInst._id = rawDoc._id!;

    const instance = merge(emptyInst, rawDoc, emptyInst.getClassMap());
    await this.onAccess?.(instance);
    this.set(instance);

    return instance;
  }

  async loadAll(noDuplicates = false): Promise<Holds[]> {
    const allFiles = [...this.pathCache.values()];
    const allIds = allFiles.map((f) => path.basename(f, ".js"));

    const dbDocs = (await this.model()
      .find({ type: { $in: allIds } })
      .lean()) as DbData[];
    const dbMap = new Map(dbDocs.map((d) => [d.type, d]));

    const total: Holds[] = [];

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
        doc = (await this.model().create(this.fixInst(emptyInst))).toObject();
      }

      const instance = merge(emptyInst, doc, emptyInst.getClassMap());
      await this.onAccess?.(instance);

      this.set(instance);
      total.push(instance);
    }

    this.markReady();
    return total;
  }

  protected async _existsSlow(id: string): Promise<boolean> {
    return !!(await this.model().exists({ _id: id }).lean());
  }
}

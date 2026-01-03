import url from "url";
import ConcreteConstructor from "../../utils/concreteConstructor.js";
import { Model } from "mongoose";
import FileBasedManager from "./fileBasedManager.js";

export default abstract class HybridCachedManager<
  Holds extends {
    _id: string;
  },
  DbData extends {
    _id: string;
  }
> extends FileBasedManager<Holds> {
  abstract model(): Model<DbData>;
  abstract onSave(inst: Holds): Promise<DbData | undefined>;
  abstract onLoad(
    data: DbData,
    ctor: ConcreteConstructor<Holds>
  ): Promise<Holds>;

  protected async loadRawClass(
    type: string
  ): Promise<ConcreteConstructor<Holds> | undefined> {
    await this.ensurePathsLoaded();
    const filePath = this.pathCache.get(type);
    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    return (
      await import(
        fileUrl.toString() +
          "?t=" +
          Date.now() +
          "&debug=fromHybridCachedManager"
      )
    ).default as ConcreteConstructor<Holds>;
  }

  protected async instFromId(type: string): Promise<Holds | undefined> {
    const RawClass = await this.loadRawClass(type);
    if (!RawClass) return;
    return new RawClass() as Holds;
  }

  async load(id: string): Promise<Holds | undefined> {
    let doc = (await this.model().findById(id).lean()) as unknown as DbData;

    if (!doc) {
      const inst = await this.instFromId(id);
      if (!inst) return;

      const data = await this.onSave(inst);
      if (!data) return;

      // create base document
      doc = (await this.model().create(data)) as DbData;
    }

    const ctor = await this.loadRawClass(id);
    if (!ctor) return;

    const instance = await this.onLoad(doc, ctor);

    await this.onAccess?.(instance);
    this.set(instance);

    return instance;
  }

  async loadAll(noDuplicates = false): Promise<Holds[]> {
    await this.ensurePathsLoaded();

    const allIds = [...this.pathCache.keys()];

    const dbDocs = (await this.model()
      .find({ _id: { $in: allIds } })
      .lean()) as DbData[];
    const dbMap = new Map(dbDocs.map((d) => [d._id, d]));

    const total: Holds[] = [];

    for (const [id] of this.pathCache.entries()) {
      let doc = dbMap.get(id);

      if (!doc) {
        const inst = await this.instFromId(id);
        if (!inst) continue;

        const data = await this.onSave(inst);
        if (!data) continue;

        doc = (await this.model().create(data)) as DbData;
      }

      if (noDuplicates && (await this.exists(id))) continue;

      if (this.has(id)) {
        const cached = (await this.get(id))!;
        total.push(cached);
        continue;
      }

      const ctor = await this.loadRawClass(id);
      if (!ctor) continue;

      const instance = await this.onLoad(doc, ctor);
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

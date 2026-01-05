import path from "path";
import url from "url";
import getAllFiles from "#utils/getAllFiles.js";
import ConcreteConstructor from "#utils/concreteConstructor.js";
import FileBasedManager from "#manager/fileBasedManager.js";

export abstract class ConstructableManager<T> extends FileBasedManager<T> {
  private _classCache: Map<string, ConcreteConstructor<T>> = new Map();

  getRaw(id: string): ConcreteConstructor<T> | undefined {
    return this._classCache.get(id);
  }

  async loadRaw(id: string): Promise<ConcreteConstructor<T> | undefined> {
    if (this._classCache.has(id)) return this._classCache.get(id);

    await this.ensurePathsLoaded();

    const filePath = this.pathCache.get(id);
    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    const imported = (
      await import(
        fileUrl.toString() +
          "?t=" +
          Date.now() +
          "&debug=fromConstructableManager"
      )
    ).default as ConcreteConstructor<T>;

    this._classCache.set(id, imported);
    return imported;
  }

  async load(id: string): Promise<T | undefined> {
    const raw = await this.loadRaw(id);
    if (!raw) return;

    const instance = new raw();

    await this.onAccess?.(instance);
    this.set(instance);
    return instance;
  }

  async loadAllRaw(): Promise<ConcreteConstructor<T>[]> {
    await this.ensurePathsLoaded();

    const files = this.pathCache.values();
    const total: ConcreteConstructor<T>[] = [];

    for (const file of files) {
      const fileUrl = url.pathToFileURL(file);
      const imported = (
        await import(
          fileUrl.toString() +
            "?t=" +
            Date.now() +
            "&debug=fromConstructableManager"
        )
      ).default as ConcreteConstructor<T>;
      total.push(imported);
      this._classCache.set(path.basename(file, ".js"), imported);
    }

    return total;
  }

  async loadAll(noDuplicates = false): Promise<T[]> {
    const raw = await this.loadAllRaw();
    const total: T[] = [];

    for (const rawClass of raw) {
      const instance = new rawClass();
      const id = this.getKey(instance);
      if (id && (!noDuplicates || !this.exists(id))) {
        await this.onAccess?.(instance);
        this.set(instance);
        total.push(instance);
      }
    }

    this.markReady();
    return total;
  }

  async _existsSlow(id: string): Promise<boolean> {
    const folders = await getAllFiles(this.folder(), true);
    const folderPath = folders.find((f) => f.includes(id));
    return !!folderPath;
  }
}
